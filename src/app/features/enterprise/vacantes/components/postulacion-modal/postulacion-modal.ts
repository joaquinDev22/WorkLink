import { Component, input, output, signal, inject } from '@angular/core'
import { VacanteResponseDTO, PostulacionResponseDTO } from '../../models/vacante.models'
import { VacanteService } from '../../services/vacante'

@Component({
  imports: [],
  selector: 'app-postulacion-modal',
  styleUrl: './postulacion-modal.css',
  templateUrl: './postulacion-modal.html'
})
export class PostulacionModal {
  private vacanteService = inject(VacanteService)

  vacante = input.required<VacanteResponseDTO>()
  isOpen = input<boolean>(false)

  close = output<void>()
  postulado = output<PostulacionResponseDTO>()

  mensaje = signal<string>('')
  isSubmitting = signal<boolean>(false)
  errorMessage = signal<string | null>(null)

  readonly MAX_CHARS = 500
  readonly cvAdjunto = 'cv_joaquin_nieva_2026.pdf'

  onClose(): void {
    if (this.isSubmitting()) return
    this.errorMessage.set(null)
    this.mensaje.set('')
    this.close.emit()
  }

  onInputMensaje(event: Event): void {
    const target = event.target as HTMLTextAreaElement
    this.mensaje.set(target.value)
    if (this.errorMessage()) {
      this.errorMessage.set(null)
    }
  }

  onSubmit(): void {
    const texto = this.mensaje().trim()
    if (!texto || texto.length < 15) {
      this.errorMessage.set('Por favor incluye una breve presentación de al menos 15 caracteres.')
      return
    }

    this.isSubmitting.set(true)
    this.errorMessage.set(null)

    this.vacanteService.postularse(this.vacante().vacanteId, texto).subscribe({
      next: (nuevaPostulacion) => {
        this.isSubmitting.set(false)
        this.mensaje.set('')
        this.postulado.emit(nuevaPostulacion)
      },
      error: (err) => {
        this.isSubmitting.set(false)
        const errorMsg =
          err?.error?.message ||
          err?.message ||
          'Ya registras una postulación previa a esta búsqueda laboral.'
        this.errorMessage.set(errorMsg)
      }
    })
  }
}
