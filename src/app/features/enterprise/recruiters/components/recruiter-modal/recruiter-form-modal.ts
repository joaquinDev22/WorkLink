import { Component, output, model, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { form, minLength, maxLength, pattern, required, FormField } from '@angular/forms/signals'
import { RecruiterService } from '../../services/recruiter'
import { RecruiterFormModel, RecruiterRequestDTO, RecruiterResponseDTO } from '../../models/recruiter.models'

@Component({
  selector: 'app-recruiter-form-modal',
  standalone: true,
  imports: [CommonModule, FormField],
  templateUrl: './recruiter-form-modal.html',
  styleUrl: './recruiter-form-modal.css'
})
export class RecruiterFormModal {
  protected recruiterService = inject(RecruiterService)

  isOpen = model<boolean>(false)
  saved = output<RecruiterResponseDTO>()

  isSaving = signal<boolean>(false)
  errorGeneral = signal<string | null>(null)

  // Modelo reactivo con propiedades estrictamente no opcionales para Signal Forms
  recruiterModel = signal<RecruiterFormModel>({
    nombre: '',
    apellido: '',
    email: '',
    fechaNacimiento: '',
    area: 'Tecnología e Innovación'
  })

  // Formulario reactivo con Angular Signal Forms
  recruiterForm = form(this.recruiterModel, (f) => {
    required(f.nombre, { message: 'El nombre es obligatorio' })
    minLength(f.nombre, 2, { message: 'Debe tener al menos 2 caracteres' })
    maxLength(f.nombre, 50, { message: 'No debe superar los 50 caracteres' })

    required(f.apellido, { message: 'El apellido es obligatorio' })
    minLength(f.apellido, 2, { message: 'Debe tener al menos 2 caracteres' })
    maxLength(f.apellido, 50, { message: 'No debe superar los 50 caracteres' })

    required(f.email, { message: 'El correo electrónico corporativo es obligatorio' })
    pattern(
      f.email,
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      { message: 'Ingresa un correo electrónico corporativo válido' }
    )

    required(f.fechaNacimiento, { message: 'La fecha de nacimiento es obligatoria' })
  })

  readonly areasDisponibles = [
    'Tecnología e Innovación',
    'People & Talent Acquisition',
    'Operaciones y Ventas',
    'Finanzas y Legales',
    'Marketing y Producto',
    'Dirección General'
  ]

  cerrar(): void {
    this.errorGeneral.set(null)
    this.recruiterModel.set({
      nombre: '',
      apellido: '',
      email: '',
      fechaNacimiento: '',
      area: 'Tecnología e Innovación'
    })
    this.isOpen.set(false)
  }

  onSubmit(e: Event): void {
    e.preventDefault()

    if (this.recruiterForm().invalid()) {
      const formEl = (e.target as HTMLElement).closest('form')
      if (formEl) {
        formEl.classList.remove('input-error')
        void formEl.offsetWidth
        formEl.classList.add('input-error')
      }
      return
    }

    const val = this.recruiterModel()
    const dto: RecruiterRequestDTO = {
      nombre: val.nombre.trim(),
      apellido: val.apellido.trim(),
      email: val.email.trim().toLowerCase(),
      fechaNacimiento: val.fechaNacimiento,
      area: val.area.trim() || undefined
    }

    this.isSaving.set(true)
    this.errorGeneral.set(null)

    this.recruiterService.crearRecruiter(dto).subscribe({
      next: (nuevo) => {
        this.isSaving.set(false)
        this.saved.emit(nuevo)
        this.cerrar()
      },
      error: (err) => {
        this.isSaving.set(false)
        this.errorGeneral.set(err?.error?.message || 'Ocurrió un error al registrar el recruiter. Por favor intenta nuevamente.')
      }
    })
  }
}
