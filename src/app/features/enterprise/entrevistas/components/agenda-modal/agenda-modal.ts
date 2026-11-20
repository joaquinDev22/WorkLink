import { Picker } from '../../../../../shared/directives/picker'
import { Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { HttpErrorResponse } from '@angular/common/http'
import { FormsModule } from '@angular/forms'
import { EntrevistaService } from '../../services/entrevista'
import { EntrevistaResponseDTO } from '../../models/entrevista.models'
import { PostulacionResponseDTO } from '../../../vacantes/models/vacante.models'
import { esFinDeSemana, mananaISO, proximoDiaHabilISO } from '../../../../../core/utils/fechas'

@Component({
  imports: [FormsModule, Picker],
  selector: 'app-agenda-modal',
  styleUrl: './agenda-modal.css',
  templateUrl: './agenda-modal.html'
})
export class AgendaModal {
  private entrevistaService = inject(EntrevistaService)

  isOpen = input<boolean>(false)
  candidatos = input<PostulacionResponseDTO[]>([])
  preselectedPostulacionId = input<number | null>(null)
  // Si viene una entrevista, el modal reprograma esa cita en vez de agendar una nueva
  entrevista = input<EntrevistaResponseDTO | null>(null)
  readonly esReprogramacion = computed(() => this.entrevista() !== null)

  close = output<void>()
  scheduled = output<EntrevistaResponseDTO>()

  selectedPostulacionId = signal<number | null>(null)
  fecha = signal<string>('')
  hora = signal<string>('15:00')
  link = signal<string>('')
  notas = signal<string>('')

  isSubmitting = signal<boolean>(false)
  errorMsg = signal<string | null>(null)

  // Las entrevistas se agendan del día siguiente en adelante
  readonly minDate = mananaISO()
  // Horario de oficina, igual que en el backend: de lunes a viernes, de 9 a 18 hs
  readonly horaInicio = '09:00'
  readonly horaFin = '17:59'

  constructor() {
    effect(() => {
      const pre = this.preselectedPostulacionId()
      if (pre) {
        this.selectedPostulacionId.set(pre)
      } else if (this.candidatos().length > 0 && !this.selectedPostulacionId()) {
        this.selectedPostulacionId.set(this.candidatos()[0].postulacionId)
      }
    })

    effect(() => {
      const e = this.entrevista()
      if (!e) return
      this.selectedPostulacionId.set(e.postulacionId)
      this.fecha.set(e.date)
      this.hora.set(e.time?.slice(0, 5) || '15:00')
      this.link.set(e.link || '')
      this.notas.set(e.notas || '')
    })

    // Fecha sugerida por defecto: el próximo día hábil
    this.fecha.set(proximoDiaHabilISO())
  }

  onClose(): void {
    if (this.isSubmitting()) return
    this.errorMsg.set(null)
    this.close.emit()
  }

  onSubmit(): void {
    const postId = this.selectedPostulacionId()
    if (!postId) {
      this.errorMsg.set('Selecciona un candidato para agendar el encuentro.')
      return
    }

    if (!this.fecha()) {
      this.errorMsg.set('Indica una fecha válida para la entrevista.')
      return
    }

    if (this.fecha() < this.minDate) {
      this.errorMsg.set('La entrevista tiene que ser a partir de mañana.')
      return
    }

    if (esFinDeSemana(this.fecha())) {
      this.errorMsg.set('Las entrevistas se agendan de lunes a viernes.')
      return
    }

    if (!this.hora()) {
      this.errorMsg.set('Indica un horario para la entrevista.')
      return
    }

    // 'HH:mm' se compara bien como texto
    if (this.hora() < this.horaInicio || this.hora() > this.horaFin) {
      this.errorMsg.set('El horario tiene que ser de oficina: de 9 a 18 hs.')
      return
    }

    this.isSubmitting.set(true)
    this.errorMsg.set(null)

    const reprogramar = this.entrevista()
    if (reprogramar) {
      this.entrevistaService
        .reprogramarEntrevista(reprogramar.id, {
          postulacionId: reprogramar.postulacionId,
          fecha: this.fecha(),
          hora: this.hora(),
          link: this.link().trim() || undefined,
          notas: this.notas().trim() || undefined
        })
        .subscribe({
          next: (actualizada) => {
            this.isSubmitting.set(false)
            this.scheduled.emit(actualizada)
            this.onClose()
          },
          error: (err: HttpErrorResponse) => {
            this.isSubmitting.set(false)
            this.errorMsg.set(err.error?.details?.[0] ?? 'Error al reprogramar la entrevista. Inténtalo nuevamente.')
          }
        })
      return
    }

    const cand = this.candidatos().find((c) => c.postulacionId === Number(postId))
    const candidatoInfo = cand
      ? {
          candidateName: cand.nombreCandidato,
          candidateEmail: cand.emailCandidato,
          vacancyTitle: cand.puestoVacante
        }
      : undefined

    this.entrevistaService
      .crearEntrevista(
        {
          postulacionId: Number(postId),
          fecha: this.fecha(),
          hora: this.hora(),
          link: this.link().trim() || undefined,
          notas: this.notas().trim() || undefined
        },
        candidatoInfo
      )
      .subscribe({
        next: (nueva) => {
          this.isSubmitting.set(false)
          this.scheduled.emit(nueva)
          this.onClose()
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmitting.set(false)
          // El backend explica el motivo (p. ej. "ya tiene una entrevista programada; reprográmala")
          this.errorMsg.set(err.error?.details?.[0] ?? 'Error al coordinar la entrevista. Inténtalo nuevamente.')
        }
      })
  }
}
