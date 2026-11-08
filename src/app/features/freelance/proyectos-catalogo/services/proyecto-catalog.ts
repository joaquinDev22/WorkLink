import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import {
  CalificacionProyectoRequestDTO,
  CalificacionProyectoResponseDTO,
  PostulacionProyectoRequestDTO,
  PostulacionProyectoResponseDTO,
  ProyectoResponseDTO
} from '../../proyecto-gestion/models/proyecto.models'

@Service()
export class ProyectoCatalog {
  readonly API_URL = `${environment.apiUrl}/freelance/proyectos`
  protected client = inject(HttpClient)

  readonly proyectos = signal<ProyectoResponseDTO[]>([])
  readonly isLoading = signal<boolean>(false)

  // GET /api/v1/freelance/proyectos - Público. Feed de proyectos freelance
  getProyectos(): Observable<ProyectoResponseDTO[]> {
    return this.client.get<ProyectoResponseDTO[]>(this.API_URL)
  }

  // GET /api/v1/freelance/proyectos/{id} o /uuid/{uuid} - Público. Detalle de proyecto
  getProyectoById(idOrUuid: number | string): Observable<ProyectoResponseDTO> {
    const path = typeof idOrUuid === 'string' && idOrUuid.startsWith('uuid/') ? idOrUuid : idOrUuid
    return this.client.get<ProyectoResponseDTO>(`${this.API_URL}/${path}`)
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/postulaciones/me - Postulación con usuario autenticado
  postularseAProyecto(
    proyectoId: number,
    datos: PostulacionProyectoRequestDTO
  ): Observable<PostulacionProyectoResponseDTO> {
    return this.client.post<PostulacionProyectoResponseDTO>(
      `${this.API_URL}/${proyectoId}/postulaciones/me`,
      datos
    )
  }

  // GET /api/v1/freelance/proyectos/{proyectoId}/postulaciones - Propuestas enviadas
  getPostulaciones(proyectoId: number): Observable<PostulacionProyectoResponseDTO[]> {
    return this.client.get<PostulacionProyectoResponseDTO[]>(
      `${this.API_URL}/${proyectoId}/postulaciones`
    )
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/calificar - Reseñar proyecto
  calificarProyecto(
    proyectoId: number,
    datos: CalificacionProyectoRequestDTO
  ): Observable<CalificacionProyectoResponseDTO> {
    return this.client.post<CalificacionProyectoResponseDTO>(
      `${this.API_URL}/${proyectoId}/calificar`,
      datos
    )
  }

  // GET /api/v1/freelance/proyectos/{proyectoId}/calificaciones - Reseñas del proyecto
  getCalificaciones(proyectoId: number): Observable<CalificacionProyectoResponseDTO[]> {
    return this.client.get<CalificacionProyectoResponseDTO[]>(
      `${this.API_URL}/${proyectoId}/calificaciones`
    )
  }
}
