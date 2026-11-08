import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import {
  EstadoHito,
  HitoRequestDTO,
  HitoResponseDTO,
  ProyectoRequestDTO,
  ProyectoResponseDTO
} from '../models/proyecto.models'

@Service()
export class ProyectoAdmin {
  readonly API_URL = `${environment.apiUrl}/freelance/proyectos`
  protected client = inject(HttpClient)

  readonly misProyectos = signal<ProyectoResponseDTO[]>([])
  readonly isLoading = signal<boolean>(false)

  // GET /api/v1/freelance/proyectos/me/publicados - Proyectos del cliente autenticado
  getMisProyectosPublicados(): Observable<ProyectoResponseDTO[]> {
    return this.client.get<ProyectoResponseDTO[]>(`${this.API_URL}/me/publicados`)
  }

  // GET /api/v1/freelance/proyectos/me/asignados - Proyectos del freelancer autenticado
  getMisProyectosAsignados(): Observable<ProyectoResponseDTO[]> {
    return this.client.get<ProyectoResponseDTO[]>(`${this.API_URL}/me/asignados`)
  }

  // POST /api/v1/freelance/proyectos/me - Publicar nuevo proyecto freelance
  publicarProyecto(datos: ProyectoRequestDTO): Observable<ProyectoResponseDTO> {
    return this.client.post<ProyectoResponseDTO>(`${this.API_URL}/me`, datos)
  }

  // PUT /api/v1/freelance/proyectos/{id}/asignar?employeeId={id} - Adjudicar proyecto
  asignarProyecto(proyectoId: number, employeeId: number): Observable<void> {
    return this.client.put<void>(
      `${this.API_URL}/${proyectoId}/asignar`,
      null,
      { params: { employeeId: employeeId.toString() } }
    )
  }

  // PUT /api/v1/freelance/proyectos/{id}/cancelar - Cancelar proyecto
  cancelarProyecto(proyectoId: number): Observable<void> {
    return this.client.put<void>(`${this.API_URL}/${proyectoId}/cancelar`, null)
  }

  // GET /api/v1/freelance/proyectos/{proyectoId}/hitos - Lista de hitos
  getHitos(proyectoId: number): Observable<HitoResponseDTO[]> {
    return this.client.get<HitoResponseDTO[]>(`${this.API_URL}/${proyectoId}/hitos`)
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/hitos - Crear hito
  crearHito(proyectoId: number, datos: HitoRequestDTO): Observable<HitoResponseDTO> {
    return this.client.post<HitoResponseDTO>(`${this.API_URL}/${proyectoId}/hitos`, datos)
  }

  // PUT /api/v1/freelance/proyectos/{proyectoId}/hitos/{hitoId}/estado?nuevoEstado=PENDIENTE|COMPLETADO|PAGADO
  actualizarEstadoHito(
    proyectoId: number,
    hitoId: number,
    nuevoEstado: EstadoHito
  ): Observable<void> {
    return this.client.put<void>(
      `${this.API_URL}/${proyectoId}/hitos/${hitoId}/estado`,
      null,
      { params: { nuevoEstado } }
    )
  }
}
