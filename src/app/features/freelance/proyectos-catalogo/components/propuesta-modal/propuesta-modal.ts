import { Component, HostListener, inject, input, model, output, signal } from '@angular/core'
import { ProyectoCatalog } from '../../services/proyecto-catalog'
import {
  PostulacionProyectoResponseDTO,
  ProyectoResponseDTO
} from '../../../proyecto-gestion/models/proyecto.models'

@Component({
  selector: 'app-propuesta-modal',
  imports: [],
  styleUrl: './propuesta-modal.css',
  templateUrl: './propuesta-modal.html'
})
export class PropuestaModal {
  private catalogService = inject(ProyectoCatalog)

  isOpen = model<boolean>(false)
  proyecto = input<ProyectoResponseDTO | null>(null)
  propuestaEnviada = output<PostulacionProyectoResponseDTO>()

  costo = signal<number | null>(null)
  tiempoEntrega = signal<string>('2 semanas')
  descripcion = signal<string>('')

  isSubmitting = signal<boolean>(false)
  mensajeExito = signal<string | null>(null)
  errorMsg = signal<string | null>(null)

  readonly plazosSugeridos = ['1 semana', '2 semanas', '1 mes', 'A convenir']

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.cerrar()
    }
  }

  cerrar(): void {
    if (this.isSubmitting()) return
    this.isOpen.set(false)
    setTimeout(() => {
      this.mensajeExito.set(null)
      this.errorMsg.set(null)
    }, 260)
  }

  actualizarCosto(valorRaw: string): void {
    const parsed = Number(valorRaw)
    this.costo.set(valorRaw === '' || Number.isNaN(parsed) ? null : parsed)
  }

  seleccionarTiempo(tiempo: string): void {
    this.tiempoEntrega.set(tiempo)
  }

  enviarPropuesta(event: Event): void {
    event.preventDefault()
    this.errorMsg.set(null)

    const project = this.proyecto()
    if (!project) return

    const monto = this.costo()
    const desc = this.descripcion().trim()

    if (!monto || monto <= 0) {
      this.errorMsg.set('Ingresa un monto válido en pesos mayor a 0.')
      return
    }

    if (desc.length < 15) {
      this.errorMsg.set('Describe tu enfoque técnico en al menos 15 caracteres.')
      return
    }

    this.isSubmitting.set(true)
    const descripcionCompleta = `${desc}\n\nPlazo estimado de entrega: ${this.tiempoEntrega()}`

    this.catalogService
      .postularseAProyecto(project.proyectoId, {
        costo: monto,
        descripcion: descripcionCompleta,
        employeeId: 0
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting.set(false)
          this.mensajeExito.set(
            `Tu propuesta de $${res.costoPropuesto} fue enviada al cliente correctamente.`
          )
          this.propuestaEnviada.emit(res)
          this.descripcion.set('')
          this.costo.set(null)
        },
        error: (err) => {
          this.isSubmitting.set(false)
          this.errorMsg.set(
            err.error?.message ||
              err.error?.error ||
              'No se pudo enviar la propuesta. Verifica tus datos o intenta nuevamente.'
          )
        }
      })
  }
}
