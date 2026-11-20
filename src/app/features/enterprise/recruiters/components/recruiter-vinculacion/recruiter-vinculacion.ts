import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { DatePipe } from '@angular/common'
import { RecruiterVinculacionService } from '../../services/recruiter-vinculacion'

// Aviso "te contrató X" + solicitud de baja (si la empresa no responde en 15 días, el recruiter se va por su cuenta)
@Component({
  selector: 'app-recruiter-vinculacion',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './recruiter-vinculacion.html'
})
export class RecruiterVinculacion implements OnInit {
  protected service = inject(RecruiterVinculacionService)

  readonly vinculacion = this.service.vinculacion
  readonly sinEmpresa = this.service.sinEmpresa
  readonly isMutating = this.service.isMutating

  readonly confirmandoSolicitud = signal<boolean>(false)
  readonly mensaje = signal<string | null>(null)
  readonly error = signal<string | null>(null)

  readonly puedeIrseSolo = computed(() => {
    const habilitada = this.vinculacion()?.fechaBajaHabilitada
    return !!habilitada && new Date(habilitada).getTime() <= Date.now()
  })

  readonly diasRestantes = computed(() => {
    const habilitada = this.vinculacion()?.fechaBajaHabilitada
    if (!habilitada) return 0
    return Math.max(0, Math.ceil((new Date(habilitada).getTime() - Date.now()) / 86_400_000))
  })

  ngOnInit(): void {
    this.service.cargar().subscribe({ error: () => {} })
  }

  entendido(): void {
    this.service.marcarVista().subscribe({ error: (err) => this.mostrarError(err) })
  }

  solicitarBaja(): void {
    this.limpiar()
    this.service.solicitarBaja().subscribe({
      next: () => {
        this.confirmandoSolicitud.set(false)
        this.mensaje.set('Le enviamos tu solicitud de baja a la empresa. Si no responde en 15 días, vas a poder desvincularte por tu cuenta.')
      },
      error: (err) => this.mostrarError(err)
    })
  }

  cancelarSolicitud(): void {
    this.limpiar()
    this.service.cancelarBaja().subscribe({
      next: () => this.mensaje.set('Cancelaste la solicitud de baja.'),
      error: (err) => this.mostrarError(err)
    })
  }

  irmeSolo(): void {
    this.limpiar()
    this.service.confirmarBaja().subscribe({
      next: () => this.mensaje.set('Te desvinculaste de la empresa.'),
      error: (err) => this.mostrarError(err)
    })
  }

  private limpiar(): void {
    this.mensaje.set(null)
    this.error.set(null)
  }

  private mostrarError(err: { error?: { message?: string } }): void {
    this.error.set(err?.error?.message || 'No se pudo completar la acción. Intentá nuevamente.')
  }
}
