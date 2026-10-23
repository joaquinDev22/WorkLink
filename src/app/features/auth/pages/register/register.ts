import { Component, computed, inject, signal } from '@angular/core';
import { Auth } from '../../../../core/auth/services/auth';
import { RegisterRequestDTO } from '../../models/auth.models';
import { email, form, maxLength, minLength, pattern, required, FormField, validate } from '@angular/forms/signals';
import { UserRole } from '../../../../core/models/user-role';

export interface OpcionRol {
  rol: UserRole
  titulo: string
  descripcion: string
  icono: string
}
export interface FormularioRegistro extends RegisterRequestDTO {
  confirmPassword: string;
}

@Component({
  imports: [FormField],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private auth = inject(Auth)

  errorServidor = signal<string | null>(null)

  intencion = signal<'CONTRATAR'|'TRABAJAR'|''>('')

  showPassword = signal<boolean>(false)
  showConfirmPassword = signal<boolean>(false)

  dropdownRolesAbierto = signal<boolean>(false);

  private rolesTrabajo : OpcionRol[] = [
    {
      rol:'FREELANCER',
      titulo:'Freelancer',
      descripcion:'Ofrecer mis servicios independientes y proyectos.',
      icono: '/freelance.svg'
    },
    {
      rol:'POSTULANTE',
      titulo:'Postulante',
      descripcion:'Buscar empleo formal en empresas y postularme a vacantes.',
      icono: '/curriculum.svg'
    }
  ]

  private rolesContratar: OpcionRol[] = [
    {
      rol: 'CLIENTE',
      titulo: 'Cliente',
      descripcion: 'Contratar freelancers para tareas o proyectos específicos.',
      icono: '/cliente.svg'
    },
    {
      rol: 'EMPRESA',
      titulo: 'Empresa',
      descripcion: 'Publicar ofertas laborales y gestionar contrataciones.',
      icono: '/empresa.svg'
    },
    {
      rol: 'RECRUITER',
      titulo: 'Recruiter',
      descripcion: 'Cazar y seleccionar talento especializado.',
      icono: '/recruiter.svg'
    }
  ];

  rolesVisibles = computed(() => {
    return this.intencion() === 'TRABAJAR' ? this.rolesTrabajo : this.rolesContratar;
  });

  
  registerModel = signal<FormularioRegistro>({
      usuario: '',
      email: '',
      password: '',
      confirmPassword:'',
      rol: ''
  })

  registerForm = form(this.registerModel, (field) =>{
    
    required(field.usuario, {message:'El usuario es obligatorio'})
    minLength(field.usuario,3,{message:'El nombre de usuario debe tener mas de 3 caracteres'})
    maxLength(field.usuario,15,{message:'El nombre de usuario no puede tener mas de 15 caracteres'})
    
    required(field.email, {message:'El email es obligatorio'})
    email(field.email, {message:'Ingrese un email valido'})

    required(field.password, {message:'La contraseña es obligatoria'})
    minLength(field.password, 8, { message: 'Debe tener al menos 8 caracteres' })
    pattern(field.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message: 'Debe incluir al menos una mayúscula, una minúscula y un número'
    })
    validate(field.password, ({ value }) => {
      const val = value() || ''

      if (!val) return null // Si está vacío se encarga el 'required'

      const faltantes: string[] = []
      if (!/[A-Z]/.test(val)) faltantes.push('una mayúscula')
      if (!/[a-z]/.test(val)) faltantes.push('una minúscula')
      if (!/\d/.test(val)) faltantes.push('un número')
      if (faltantes.length > 0) {
        return {
          kind: 'pattern',
          message: `Debe incluir al menos: ${faltantes.join(', ')}`
        };
      }
      return null;
    });
    
    validate(field.confirmPassword, ({ value }) => {
      const confirm = value();
      const pass = this.registerForm.password().value() // Señal directa reactiva

      if (!confirm) {
        return { kind: 'required', message: 'Debes repetir la contraseña' };
      }
      if (confirm !== pass) {
        return { kind: 'mismatch', message: 'Las contraseñas no coinciden' };
      }
      return null;
    });

    required(field.rol, {message:'El rol es obligatorio'})
  })

  reqPassword = computed(() => {
    const pwd = this.registerForm.password().value() || '';
    return {
      longitud: pwd.length >= 8,
      mayuscula: /[A-Z]/.test(pwd),
      minuscula: /[a-z]/.test(pwd),
      numero: /\d/.test(pwd),
      valida: pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd)
    };
  });
  // Nivel de 0 a 4
  nivelFortaleza = computed(() => {
    const pwd = this.registerModel().password || ''
    if (!pwd) return 0
    
    let score = 0
    if (pwd.length >= 8) score++            // Longitud
    if (/[A-Z]/.test(pwd)) score++          // Mayúscula
    if (/[0-9]/.test(pwd)) score++          // Número
    if (/[^A-Za-z0-9]/.test(pwd)) score++  // Símbolo especial (@, $, !, etc.)

    return score;
  })

  textoFortaleza = computed(() => {
    switch (this.nivelFortaleza()) {
      case 1: return { texto: 'Débil', color: 'text-red-400', bar: 'w-1/4 bg-red-500' }
      case 2: return { texto: 'Media', color: 'text-amber-400', bar: 'w-2/4 bg-amber-500' }
      case 3: return { texto: 'Buena', color: 'text-sky-400', bar: 'w-3/4 bg-brand-sky' }
      case 4: return { texto: 'Fuerte', color:
      'text-emerald-400', bar: 'w-full bg-emerald-500' }
      default: return { texto: '', color: '', bar: 'w-0' }
    }
  })

  seleccionarIntencion(nuevaIntencion: 'TRABAJAR' | 'CONTRATAR'): void {
    this.intencion.set(nuevaIntencion);
    const primerRol = nuevaIntencion === 'TRABAJAR' ? 'FREELANCER' : 'CLIENTE';
    this.registerModel.update(m => ({ ...m, rol: primerRol }));
  }

  
  rolSeleccionado = computed(() => {
    const rolActual = this.registerModel().rol;
    return this.rolesVisibles().find(r => r.rol === rolActual) ?? this.rolesVisibles()[0];
  });// 2. Información del rol actualmente seleccionado (para mostrarlo en el botón cerrado)

  seleccionarRol(rol: UserRole): void {
    this.registerModel.update(m => ({ ...m, rol }));
    this.dropdownRolesAbierto.set(false);
  }// 3. Al elegir un rol, lo actualizamos y cerramos el dropdown
  
  crearCuenta(e: Event) {

    e.preventDefault();

    this.errorServidor.set(null); // Limpiamos errores previos
    if (this.registerForm().invalid()) return;

    const {confirmPassword, ...payload} = this.registerModel();

    this.auth.register(payload).subscribe({
      next: () => {
        // Éxito: ya redirige a /
      },
      error: (err) => {
        // Si el backend devuelve 409 (Conflict) o 400 con mensaje de duplicado
        if (err.status === 409 || err.status === 400) {
          this.errorServidor.set(err.error?.message || 'El usuario o el correo ya se encuentran registrados.');
        } else {
          this.errorServidor.set('Ocurrió un error en el servidor. Intenta nuevamente.');
        }
      }
    });
  }
}
