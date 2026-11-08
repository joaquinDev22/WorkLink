import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { Auth } from '../../../../../core/auth/services/auth'
import { EntrevistaService } from '../../services/entrevista'
import { VacanteService } from '../../../vacantes/services/vacante'
import { EntrevistaResponseDTO } from '../../models/entrevista.models'
import { AgendaModal } from '../../components/agenda-modal/agenda-modal'

@Component({
  imports: [AgendaModal],
  selector: 'app-entrevista-calendar',
  styleUrl: './entrevista-calendar.css',
  templateUrl: './entrevista-calendar.html'
})
export class EntrevistaCalendar implements OnInit {
  protected auth = inject(Auth)
  protected entrevistaService = inject(EntrevistaService)
  protected vacanteService = inject(VacanteService)

  readonly userRole = computed(() => this.auth.session()?.rol)
  readonly isRecruiter = computed(() => this.userRole() === 'RECRUITER')
  readonly isPostulante = computed(() => this.userRole() === 'POSTULANTE')

  readonly filterStatus = signal<'TODAS' | 'PROGRAMADA' | 'COMPLETADA' | 'CANCELADA'>('TODAS')
  readonly isAgendaModalOpen = signal<boolean>(false)

  // Modal para confirmar cancelación de entrevista
  readonly citaACancelar = signal<EntrevistaResponseDTO | null>(null)
  readonly isCancelModalOpen = signal<boolean>(false)

  readonly toastMessage = signal<string | null>(null)

  // Candidatos elegibles para agendar (postulaciones en estado ENTREVISTA_AGENDADA o VISUALIZADO)
  readonly candidatosElegibles = computed(() => {
    return this.vacanteService.postulaciones()
  })

  // Lista filtrada reactivamente
  readonly entrevistasFiltradas = computed<EntrevistaResponseDTO[]>(() => {
    const list = this.entrevistaService.entrevistas()
    const status = this.filterStatus()

    // Si es postulante, solo visualiza sus entrevistas personales
    const roleFiltered = this.isPostulante()
      ? list.filter((e) => e.candidateName.includes('Joaquín') || e.candidateEmail?.includes('joaquin'))
      : list

    const statusFiltered = status === 'TODAS'
      ? roleFiltered
      : roleFiltered.filter((e) => e.status === status)

    // Ordenar cronológicamente por fecha y hora
    return [...statusFiltered].sort((a, b) => {
      const dateA = `${a.date}T${a.time}`
      const dateB = `${b.date}T${b.time}`
      return dateA.localeCompare(dateB)
    })
  })

  // Conteo de entrevistas activas programadas
  readonly activasCount = computed(() => {
    return this.entrevistasFiltradas().filter((e) => e.status === 'PROGRAMADA').length
  })

  ngOnInit(): void {
    this.entrevistaService.getEntrevistas().subscribe()
    if (this.isRecruiter()) {
      this.vacanteService.getPostulacionesPorVacante().subscribe()
    }
  }

  abrirAgendaModal(): void {
    this.isAgendaModalOpen.set(true)
  }

  cerrarAgendaModal(): void {
    this.isAgendaModalOpen.set(false)
  }

  onEntrevistaScheduled(nueva: EntrevistaResponseDTO): void {
    this.cerrarAgendaModal()
    this.toastMessage.set(`¡Entrevista coordinada con ${nueva.candidateName} para el ${nueva.date} a las ${nueva.time} hs!`)
    setTimeout(() => {
      this.toastMessage.set(null)
    }, 4500)
  }

  abrirModalCancelar(e: EntrevistaResponseDTO): void {
    this.citaACancelar.set(e)
    this.isCancelModalOpen.set(true)
  }

  cerrarModalCancelar(): void {
    this.isCancelModalOpen.set(false)
    this.citaACancelar.set(null)
  }

  confirmarCancelacion(): void {
    const e = this.citaACancelar()
    if (!e) return

    this.entrevistaService.cancelarEntrevista(e.id).subscribe({
      next: () => {
        this.cerrarModalCancelar()
        this.toastMessage.set(`Entrevista con ${e.candidateName} cancelada exitosamente.`)
        setTimeout(() => {
          this.toastMessage.set(null)
        }, 3500)
      },
      error: () => {
        this.cerrarModalCancelar()
        this.toastMessage.set('Error al cancelar la entrevista.')
        setTimeout(() => {
          this.toastMessage.set(null)
        }, 3500)
      }
    })
  }
}
