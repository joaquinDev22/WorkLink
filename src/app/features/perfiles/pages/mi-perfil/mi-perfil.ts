import { Component, OnInit, inject, computed, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Perfil } from '../../services/perfil'
import { EditProfileModel, NivelHabilidad, PerfilUsuarioDTO } from '../../models/perfil.models'
import { form, maxLength, minLength, pattern, required, validate, FormField } from '@angular/forms/signals'

export const PATTERNS_TELEFONO: Record<string, { regex: RegExp, ejemplo: string }> = {
  AR: {
    regex: /^\+54\s?(9\s?)?\d{2,4}\s?\d{6,8}$/,
    ejemplo: '+54 9 11 1234 5678'
  },
  MX: {
    regex: /^\+52\s?\d{2,3}\s?\d{7,8}$/,
    ejemplo: '+52 55 1234 5678'
  },
  ES: {
    regex: /^\+34\s?[6789]\d{8}$/,
    ejemplo: '+34 612 345 678'
  },
  CO: {
    regex: /^\+57\s?3\d{9}$/,
    ejemplo: '+57 300 123 4567'
  },
  CL: {
    regex: /^\+56\s?9\s?\d{8}$/,
    ejemplo: '+56 9 1234 5678'
  },
  OTRO: {
    regex: /^\+[1-9]\d{6,14}$/,
    ejemplo: '+1 555 123 4567'
  }
}

@Component({
  imports: [CommonModule, FormsModule, FormField],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
  protected perfilService = inject(Perfil)

  readonly perfil = this.perfilService.perfilActual
  readonly isLoading = this.perfilService.isLoading
  readonly completitud = this.perfilService.completitud

  // Modal de edición de perfil (WL-14)
  isEditModalOpen = signal<boolean>(false)
  isSaving = signal<boolean>(false)
  toastMsg = signal<string | null>(null)

  // Modelo de formulario de edición
  profileModel = signal<EditProfileModel>({
    nombre: '',
    apellido: '',
    descripcion: '',
    telefono: '',
    ubicacion: '',
    sitioWeb: ''
  })

  editForm = form(this.profileModel, (f) => {

    required(f.nombre, {message:'El nombre es obligatorio'})
    minLength(f.nombre,3,{message:'El nombre debe tener minimo 3 caracteres'})
    maxLength(f.nombre,10,{message:'El nombre no puede tener mas de 10 caracteres'})
    pattern(f.nombre, /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/, {
      message:'El nombre no puede incluir caracteres especiales'
    })

    required(f.apellido, {message:'El apellido es obligatorio'})
    minLength(f.apellido,5,{message:'El apellido debe tener minimo 5 caracteres'})
    maxLength(f.apellido,10,{message:'El nombre debe tener minimo 10 caracteres'})
    pattern(f.apellido, /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/, {
      message:'El apellido no puede incluir caracteres especiales'
    })

    pattern(f.sitioWeb,/^(https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))?$/,
      {message: 'El sitio web debe comenzar con https:// y tener un dominio válido'}
    )

     validate(f.telefono, ({ value }) => {
    const tel = value()?.trim()
    if (!tel) return null
    const pais = this.profileModel().ubicacion || 'AR'
    const config = PATTERNS_TELEFONO[pais] || PATTERNS_TELEFONO['OTRO']
    const limpio = tel.replace(/[-\s]/g, '')
    if (!config.regex.test(tel) && !config.regex.test(limpio)) {
      return {
        kind: 'pattern',
        message: `Formato requerido para ${pais}: ${config.ejemplo}`
      }
    }
    return null
  })
})
  readonly initial = computed<string>(() => {
    const p = this.perfil()
    if (!p) return 'U'
    return p.nombre?.charAt(0)?.toUpperCase() || 'U'
  })

  readonly fotoUrl = computed<string | null>(() => {
    const foto = this.perfil()?.fotoPerfil
    if (!foto) return null
    if (foto.startsWith('data:') || foto.startsWith('http')) return foto
    return `data:image/jpeg;base64,${foto}`
  })

  readonly bannerUrl = computed<string | null>(() => {
    const banner = this.perfil()?.bannerPerfil
    if (!banner) return null
    if (banner.startsWith('data:') || banner.startsWith('http')) return banner
    return `data:image/jpeg;base64,${banner}`
  })

  ngOnInit(): void {
    if (!this.perfil()) {
      this.perfilService.cargarPerfil().subscribe()
    }
  }

  onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      this.perfilService.uploadPhoto(file).subscribe({
        next: () => this.showToast('Foto de perfil actualizada correctamente'),
        error: (err) => console.error('Error al subir foto', err)
      })
    }
  }

  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      this.perfilService.uploadBanner(file).subscribe({
        next: () => this.showToast('Banner de portada actualizado correctamente'),
        error: (err) => console.error('Error al subir banner', err)
      })
    }
  }

  toggleEditModal(): void {
    const current = this.perfil()
    if (current) {
      this.profileModel.set({
        nombre: current.nombre || '',
        apellido: current.apellido || '',
        descripcion: current.descripcion || '',
        telefono: current.telefono || '',
        ubicacion: current.ubicacion || '',
        sitioWeb: current.sitioWeb || ''
      })
    }
    this.isEditModalOpen.update(v => !v)
  }

  guardarCambios(): void {
    const form = this.editForm()
    if (!form.value) return

    this.isSaving.set(true)
    this.perfilService.updateProfile(form.value()).subscribe({
      next: () => {
        this.isSaving.set(false)
        this.isEditModalOpen.set(false)
        this.showToast('Perfil actualizado con éxito')
      },
      error: (err) => {
        this.isSaving.set(false)
        console.error('Error al actualizar perfil', err)
      }
    })
  }

  showToast(msg: string): void {
    this.toastMsg.set(msg)
    setTimeout(() => {
      this.toastMsg.set(null)
    }, 3500)
  }

  getNivelInfo(nivel: NivelHabilidad): { label: string, colorClass: string, stars: number } {
    switch (nivel) {
      case 1:
        return { label: 'Básico', colorClass: 'bg-slate-100 text-slate-700 border-slate-200', stars: 1 }
      case 2:
        return { label: 'Intermedio', colorClass: 'bg-sky-50 text-sky-700 border-sky-200', stars: 2 }
      case 3:
        return { label: 'Avanzado', colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', stars: 3 }
      case 4:
        return { label: 'Experto', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', stars: 4 }
      default:
        return { label: 'Nivel no definido', colorClass: 'bg-slate-100 text-slate-600 border-slate-200', stars: 1 }
    }
  }
}
