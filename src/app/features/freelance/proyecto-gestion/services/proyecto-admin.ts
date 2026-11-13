import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, delay, finalize, Observable, of, tap, throwError } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { TokenStorage } from '../../../../core/auth/services/token-storage'
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
  protected tokenStorage = inject(TokenStorage)

  readonly misProyectos = signal<ProyectoResponseDTO[]>([])
  readonly isLoading = signal<boolean>(false)
  readonly isMutating = signal<boolean>(false)

  // GET /api/v1/freelance/proyectos/me/publicados - Proyectos del cliente autenticado
  getMisProyectosPublicados(): Observable<ProyectoResponseDTO[]> {
    this.isLoading.set(true)

    return this.client.get<ProyectoResponseDTO[]>(`${this.API_URL}/me/publicados`).pipe(
      tap((data) => this.misProyectos.set(Array.isArray(data) ? data : [])),
      finalize(() => this.isLoading.set(false))
    )
  }

  // GET /api/v1/freelance/proyectos/me/asignados - Proyectos del freelancer autenticado
  getMisProyectosAsignados(): Observable<ProyectoResponseDTO[]> {
    this.isLoading.set(true)

    // Solo omite la petición en JWT exclusivos de roles no candidatos (CLIENTE, EMPRESA, RECRUITER)
    const tokenRol = this.tokenStorage.getJwtRol()?.replace(/^ROLE_/i, '').toUpperCase()
    if (tokenRol && !['FREELANCER', 'POSTULANTE', 'EMPLOYEE'].includes(tokenRol)) {
      this.misProyectos.set([])
      this.isLoading.set(false)
      return of([])
    }

    return this.client.get<ProyectoResponseDTO[]>(`${this.API_URL}/me/asignados`).pipe(
      catchError((err) => {
        if (err?.status === 403 || err?.status === 404) {
          return of([])
        }
        return throwError(() => err)
      }),
      tap((data) => this.misProyectos.set(Array.isArray(data) ? data : [])),
      finalize(() => this.isLoading.set(false))
    )
  }

  // POST /api/v1/freelance/proyectos/me - Publicar nuevo proyecto freelance
  publicarProyecto(datos: ProyectoRequestDTO): Observable<ProyectoResponseDTO> {
    this.isMutating.set(true)

    return this.client
      .post<ProyectoResponseDTO>(`${this.API_URL}/me`, datos)
      .pipe(finalize(() => this.isMutating.set(false)))
  }

  // PUT /api/v1/freelance/proyectos/{id} - Editar proyecto publicado
  actualizarProyecto(proyectoId: number, datos: ProyectoRequestDTO): Observable<ProyectoResponseDTO> {
    this.isMutating.set(true)
    return this.client
      .put<ProyectoResponseDTO>(`${this.API_URL}/${proyectoId}`, datos)
      .pipe(finalize(() => this.isMutating.set(false)))
  }

  // PUT /api/v1/freelance/proyectos/{id}/asignar?employeeId={id} - Adjudicar proyecto
  asignarProyecto(proyectoId: number, employeeId: number): Observable<ProyectoResponseDTO> {
    this.isMutating.set(true)

    return this.client
      .put<ProyectoResponseDTO>(`${this.API_URL}/${proyectoId}/asignar`, null, {
        params: { employeeId: employeeId.toString() }
      })
      .pipe(finalize(() => this.isMutating.set(false)))
  }

  // PUT /api/v1/freelance/proyectos/{id}/cancelar - Cancelar proyecto
  cancelarProyecto(proyectoId: number): Observable<void> {
    this.isMutating.set(true)

    return this.client
      .put<void>(`${this.API_URL}/${proyectoId}/cancelar`, null)
      .pipe(finalize(() => this.isMutating.set(false)))
  }

  // GET /api/v1/freelance/proyectos/{proyectoId}/hitos - Lista de hitos
  getHitos(proyectoId: number): Observable<HitoResponseDTO[]> {
    return this.client.get<HitoResponseDTO[]>(`${this.API_URL}/${proyectoId}/hitos`)
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/hitos - Crear hito
  crearHito(proyectoId: number, datos: HitoRequestDTO): Observable<HitoResponseDTO> {
    this.isMutating.set(true)

    return this.client
      .post<HitoResponseDTO>(`${this.API_URL}/${proyectoId}/hitos`, datos)
      .pipe(finalize(() => this.isMutating.set(false)))
  }

  // PUT /api/v1/freelance/proyectos/{proyectoId}/hitos/{hitoId}/estado?nuevoEstado=COMPLETADO (EN_PROGRESO lo pone el webhook de pago)
  actualizarEstadoHito(
    proyectoId: number,
    hitoId: number,
    nuevoEstado: EstadoHito
  ): Observable<void> {
    this.isMutating.set(true)

    return this.client
      .put<void>(`${this.API_URL}/${proyectoId}/hitos/${hitoId}/estado`, null, {
        params: { nuevoEstado }
      })
      .pipe(finalize(() => this.isMutating.set(false)))
  }
}
