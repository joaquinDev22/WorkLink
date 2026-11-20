import { fechaLegible } from '../../../../../core/utils/fechas'
import { Paginator, paginar } from '../../../../../shared/components/paginator/paginator'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { Auth } from '../../../../../core/auth/services/auth'
import { VacanteService } from '../../services/vacante'
import { EstadoPostulacion, PostulacionResponseDTO, VacanteResponseDTO } from '../../models/vacante.models'
import { AgendaModal } from '../../../entrevistas/components/agenda-modal/agenda-modal'
import { EntrevistaResponseDTO } from '../../../entrevistas/models/entrevista.models'

@Component({
  imports: [RouterLink, AgendaModal, Paginator],
  selector: 'app-vacante-postulantes',
  styleUrl: './vacante-postulantes.css',
  templateUrl: './vacante-postulantes.html'
})
export class VacantePostulantes implements OnInit {
  protected auth = inject(Auth)
  protected vacanteService = inject(VacanteService)
  private route = inject(ActivatedRoute)

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

  // Vacantes de la empresa del recruiter para el selector de filtro (no todo el catálogo público)
  readonly vacantesDisponibles = computed<VacanteResponseDTO[]>(() => {
    return this.vacanteService.misVacantes()
  })

  // Lista filtrada reactivamente
  readonly postulacionesFiltradas = computed(() => {
    const term = this.searchFilter().toLowerCase().trim()
    const estado = this.estadoFilter()
    const vacanteId = this.vacanteFilter()
    const list = this.vacanteService.postulaciones()

    // Si es postulante, solo ve sus propias postulaciones (employeeId 300 / tú)
    // El backend ya devuelve solo las postulaciones que le corresponden al usuario autenticado
    const filteredByRole = list

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

  readonly pagina = signal<number>(1)
  readonly postulacionesPagina = computed(() => paginar(this.postulacionesFiltradas(), this.pagina(), 10))

  ngOnInit(): void {
    // Si se llega desde una vacante ("Ver candidatos"), el listado arranca filtrado por esa vacante
    const vacanteId = Number(this.route.snapshot.queryParamMap.get('vacanteId'))
    if (vacanteId) this.vacanteFilter.set(vacanteId)
    if (this.isRecruiter()) this.vacanteService.getMisVacantes().subscribe()
    this.vacanteService.getPostulacionesPorVacante().subscribe()
  }

  // Orden del proceso: una postulación solo avanza, nunca vuelve a una etapa anterior
  private readonly ordenEstados: EstadoPostulacion[] = ['PENDIENTE', 'VISUALIZADO', 'ENTREVISTA_AGENDADA', 'RECHAZADO']

  esEstadoAnterior(actual: EstadoPostulacion, opcion: EstadoPostulacion): boolean {
    return this.ordenEstados.indexOf(opcion) < this.ordenEstados.indexOf(actual)
  }

  cambiarEstado(
    postulacion: PostulacionResponseDTO,
    event: Event
  ): void {
    const select = event.target as HTMLSelectElement
    const nuevoEstado = select.value as EstadoPostulacion

    if (nuevoEstado === postulacion.estado) return

    if (this.esEstadoAnterior(postulacion.estado, nuevoEstado)) {
      select.value = postulacion.estado
      this.mostrarToast('El estado de la postulación no puede retroceder.')
      return
    }

    this.vacanteService
      .actualizarEstadoPostulacion(postulacion.vacanteId, postulacion.postulacionId, nuevoEstado)
      .subscribe({
        next: () => {
          this.toastMessage.set(`${postulacion.nombreCandidato} ahora está en "${nuevoEstado.replaceAll('_', ' ').toLowerCase()}".`)
          setTimeout(() => {
            this.toastMessage.set(null)
          }, 3500)

          if (nuevoEstado === 'ENTREVISTA_AGENDADA') {
            this.abrirAgendarPara(postulacion)
          }
        },
        error: (err) => {
          // El backend rechaza el cambio (por ejemplo, si hay una entrevista agendada): se vuelve al estado real
          select.value = postulacion.estado
          this.mostrarToast(err?.error?.message || 'No pudimos cambiar el estado. Inténtalo de nuevo.')
        }
      })
  }

  private mostrarToast(mensaje: string): void {
    this.toastMessage.set(mensaje)
    setTimeout(() => {
      this.toastMessage.set(null)
    }, 4500)
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
    // Agendar la entrevista avanza la postulación en el backend: se recarga para mostrar el estado real
    this.vacanteService.getPostulacionesPorVacante().subscribe()
    this.toastMessage.set(`Entrevista con ${nueva.candidateName} agendada para el ${fechaLegible(nueva.date)} a las ${nueva.time} hs.`)
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
        this.toastMessage.set('No pudimos descargar el CV. Inténtalo de nuevo.')
        setTimeout(() => this.toastMessage.set(null), 3000)
      }
    })
  }
}
