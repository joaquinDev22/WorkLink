import { Component, inject, input, model, signal } from '@angular/core'
import { ProyectoCatalog } from '../../services/proyecto-catalog'
import { ProyectoResponseDTO } from '../../../proyecto-gestion/models/proyecto.models'

@Component({
  selector: 'app-propuesta-modal',
  imports: [],
  styleUrl: './propuesta-modal.css',
  templateUrl: './propuesta-modal.html',
})
export class PropuestaModal {
  private catalogService = inject(ProyectoCatalog)

  isOpen = model<boolean>(false)
  proyecto = input<ProyectoResponseDTO | null>(null)

  costo = signal<number | null>(null)
  tiempoEntrega = signal<string>('2 semanas')
  descripcion = signal<string>('')

  isSubmitting = signal<boolean>(false)
  mensajeExito = signal<string | null>(null)
  errorMsg = signal<string | null>(null)

  cerrar(): void {
    if (this.isSubmitting()) return
    this.isOpen.set(false)
    // Limpieza diferida de mensajes para que la animación de cierre sea limpia
    setTimeout(() => {
      this.mensajeExito.set(null)
      this.errorMsg.set(null)
    }, 350)
  }

  seleccionarTiempo(tiempo: string): void {
    this.tiempoEntrega.set(tiempo)
  }

  enviarPropuesta(e: Event): void {
    e.preventDefault()
    this.errorMsg.set(null)

    const p = this.proyecto()
    if (!p) return

    const monto = this.costo()
    const desc = this.descripcion().trim()

    if (!monto || monto <= 0) {
      this.errorMsg.set('Ingresa un monto válido para tu cotización.')
      return
    }

    if (!desc || desc.length < 15) {
      this.errorMsg.set('Por favor escribe un mensaje de propuesta de al menos 15 caracteres.')
      return
    }

    this.isSubmitting.set(true)

    this.catalogService.postularAProyecto(p.proyectoId, {
      costo: monto,
      descripcion: desc,
      tiempoEntrega: this.tiempoEntrega()
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false)
        this.mensajeExito.set(res.mensaje)
      },
      error: (err) => {
        this.isSubmitting.set(false)
        console.error('Error al enviar propuesta:', err)
        this.errorMsg.set(err.error?.message || 'No se pudo enviar la propuesta. Intenta nuevamente.')
      }
    })
  }
}
