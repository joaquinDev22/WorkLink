import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Auth } from '../../../../../core/auth/services/auth'
import { VacanteService } from '../../services/vacante'
import { EstadoPostulacion, PostulacionResponseDTO, VacanteResponseDTO } from '../../models/vacante.models'

@Component({
  imports: [RouterLink],
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
        },
        error: () => {
          this.toastMessage.set('Error al actualizar el estado de la postulación.')
          setTimeout(() => {
            this.toastMessage.set(null)
          }, 3500)
        }
      })
  }

  abrirPreview(postulacion: PostulacionResponseDTO): void {
    this.previewPostulacion.set(postulacion)
    this.isPreviewOpen.set(true)
  }

  cerrarPreview(): void {
    this.isPreviewOpen.set(false)
    this.previewPostulacion.set(null)
  }
}
