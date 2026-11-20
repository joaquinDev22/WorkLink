import { Component, output, model, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { form, pattern, required, FormField } from '@angular/forms/signals'
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

  // La empresa solo carga el email: el resto de los datos están en la cuenta del recruiter
  recruiterModel = signal<RecruiterFormModel>({ email: '' })

  recruiterForm = form(this.recruiterModel, (f) => {
    required(f.email, { message: 'El correo electrónico es obligatorio' })
    pattern(
      f.email,
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      { message: 'Ingresa un correo electrónico válido' }
    )
  })

  cerrar(): void {
    this.errorGeneral.set(null)
    this.recruiterModel.set({ email: '' })
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
      email: val.email.trim().toLowerCase()
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
