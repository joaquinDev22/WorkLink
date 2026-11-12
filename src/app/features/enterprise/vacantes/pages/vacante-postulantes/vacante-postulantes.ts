import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Auth } from '../../../../../core/auth/services/auth'
import { VacanteService } from '../../services/vacante'
import { EstadoPostulacion, PostulacionResponseDTO, VacanteResponseDTO } from '../../models/vacante.models'
import { AgendaModal } from '../../../entrevistas/components/agenda-modal/agenda-modal'
import { EntrevistaResponseDTO } from '../../../entrevistas/models/entrevista.models'

@Component({
  imports: [RouterLink, AgendaModal],
  selector: 'app-vacante-postulantes',
  styleUrl: './vacante-postulantes.css',
  templateUrl: './vacante-postulantes.html'
})
export class VacantePostulantes implements OnInit {
  protected auth = inject(Auth)
  protected vacanteService = inject(VacanteService)

  // Rol activo
  readonly userRole = computed(() => this.auth.session()?.rol)
  readonly isRecruiter = computed(() => this.userRole() === 'RECRUITER')

  // Filtros
  readonly searchFilter = signal<string>('')
  readonly estadoFilter = signal<EstadoPostulacion | 'TODOS'>('TODOS')
  readonly vacanteFilter = signal<number | 'TODAS'>('TODAS')

  // Modal para ver carta de presentación
  readonly previewPostulacion = signal<PostulacionResponseDTO | null>(null)
  readonly isPreviewOpen = signal<boolean>(false)

  // Modal para ver y descargar CV en PDF
  readonly cvPostulacion = signal<PostulacionResponseDTO | null>(null)
  readonly isCvModalOpen = signal<boolean>(false)

  // Modal para coordinar entrevista
  readonly isAgendaModalOpen = signal<boolean>(false)
  readonly agendaPostulacionId = signal<number | null>(null)

  // Toast feedback
  readonly toastMessage = signal<string | null>(null)

  // Lista de vacantes para el selector de filtro
  readonly vacantesDisponibles = computed<VacanteResponseDTO[]>(() => {
    return this.vacanteService.catalogoVacantes()
  })

  // Lista filtrada reactivamente
  readonly postulacionesFiltradas = computed(() => {
    const term = this.searchFilter().toLowerCase().trim()
    const estado = this.estadoFilter()
    const vacanteId = this.vacanteFilter()
    const list = this.vacanteService.postulaciones()

    // Si es postulante, solo ve sus propias postulaciones (employeeId 300 / tú)
    const filteredByRole = this.isRecruiter()
      ? list
      : list.filter((p) => p.employeeId === 300 || p.nombreCandidato.includes('Joaquín'))

    return filteredByRole.filter((p) => {
      const matchText =
        !term ||
        p.nombreCandidato.toLowerCase().includes(term) ||
        p.emailCandidato.toLowerCase().includes(term) ||
        p.puestoVacante.toLowerCase().includes(term)

      const matchEstado = estado === 'TODOS' || p.estado === estado
      const matchVacante = vacanteId === 'TODAS' || p.vacanteId === vacanteId

      return matchText && matchEstado && matchVacante
    })
  })

  ngOnInit(): void {
    this.vacanteService.getCatalogoVacantes().subscribe()
    this.vacanteService.getPostulacionesPorVacante().subscribe()
  }

  cambiarEstado(
    postulacion: PostulacionResponseDTO,
    event: Event
  ): void {
    const select = event.target as HTMLSelectElement
    const nuevoEstado = select.value as EstadoPostulacion

    if (nuevoEstado === postulacion.estado) return

    this.vacanteService
      .actualizarEstadoPostulacion(postulacion.vacanteId, postulacion.postulacionId, nuevoEstado)
      .subscribe({
        next: () => {
          this.toastMessage.set(`Estado de "${postulacion.nombreCandidato}" actualizado a ${nuevoEstado}`)
          setTimeout(() => {
            this.toastMessage.set(null)
          }, 3500)

          if (nuevoEstado === 'ENTREVISTA_AGENDADA') {
            this.abrirAgendarPara(postulacion)
          }
        },
        error: () => {
          this.toastMessage.set('Error al actualizar el estado de la postulación.')
          setTimeout(() => {
            this.toastMessage.set(null)
          }, 3500)
        }
      })
  }

  abrirAgendarPara(postulacion: PostulacionResponseDTO): void {
    this.agendaPostulacionId.set(postulacion.postulacionId)
    this.isAgendaModalOpen.set(true)
  }

  cerrarAgendaModal(): void {
    this.isAgendaModalOpen.set(false)
    this.agendaPostulacionId.set(null)
  }

  onEntrevistaAgendada(nueva: EntrevistaResponseDTO): void {
    this.cerrarAgendaModal()
    this.toastMessage.set(`¡Entrevista coordinada con ${nueva.candidateName} para el ${nueva.date} a las ${nueva.time} hs!`)
    setTimeout(() => {
      this.toastMessage.set(null)
    }, 4500)
  }

  abrirPreview(postulacion: PostulacionResponseDTO): void {
    this.previewPostulacion.set(postulacion)
    this.isPreviewOpen.set(true)
  }

  cerrarPreview(): void {
    this.isPreviewOpen.set(false)
    this.previewPostulacion.set(null)
  }

  verCV(postulacion: PostulacionResponseDTO): void {
    this.cvPostulacion.set(postulacion)
    this.isCvModalOpen.set(true)
  }

  cerrarCvModal(): void {
    this.isCvModalOpen.set(false)
    this.cvPostulacion.set(null)
  }

  descargarCV(postulacion: PostulacionResponseDTO): void {
    this.vacanteService.descargarCv(postulacion.employeeId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `CV-${postulacion.nombreCandidato.replace(/\s+/g, '_')}.pdf`
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        this.toastMessage.set(`Descargando CV de ${postulacion.nombreCandidato}`)
        setTimeout(() => this.toastMessage.set(null), 3000)
      },
      error: () => {
        this.toastMessage.set('No se pudo descargar el CV.')
        setTimeout(() => this.toastMessage.set(null), 3000)
      }
    })
  }
}
