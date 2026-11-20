import { inject, Service, signal } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, tap } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { RecruiterResponseDTO } from '../models/recruiter.models'

// Lado del recruiter: a qué empresa lo vincularon, el aviso de contratación y la baja
@Service()
export class RecruiterVinculacionService {
  readonly API_URL = `${environment.apiUrl}/recruiter/vinculacion`
  protected client = inject(HttpClient)

  readonly vinculacion = signal<RecruiterResponseDTO | null>(null)
  readonly sinEmpresa = signal<boolean>(false)
  readonly isMutating = signal<boolean>(false)

  // GET /api/v1/recruiter/vinculacion (404 = todavía no lo vinculó ninguna empresa)
  cargar(): Observable<RecruiterResponseDTO> {
    return this.client.get<RecruiterResponseDTO>(this.API_URL).pipe(
      tap({
        next: (v) => {
          this.vinculacion.set(v)
          this.sinEmpresa.set(false)
        },
        error: (err: HttpErrorResponse) => {
          this.vinculacion.set(null)
          this.sinEmpresa.set(err.status === 404)
        }
      })
    )
  }

  marcarVista(): Observable<RecruiterResponseDTO> {
    return this.mutar(this.client.post<RecruiterResponseDTO>(`${this.API_URL}/visto`, {}))
  }

  solicitarBaja(): Observable<RecruiterResponseDTO> {
    return this.mutar(this.client.post<RecruiterResponseDTO>(`${this.API_URL}/baja`, {}))
  }

  cancelarBaja(): Observable<RecruiterResponseDTO> {
    return this.mutar(this.client.delete<RecruiterResponseDTO>(`${this.API_URL}/baja`))
  }

  // Solo funciona pasados 15 días sin respuesta de la empresa
  confirmarBaja(): Observable<void> {
    this.isMutating.set(true)
    return this.client.post<void>(`${this.API_URL}/baja/confirmar`, {}).pipe(
      tap({
        next: () => {
          this.vinculacion.set(null)
          this.sinEmpresa.set(true)
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }

  private mutar(req: Observable<RecruiterResponseDTO>): Observable<RecruiterResponseDTO> {
    this.isMutating.set(true)
    return req.pipe(
      tap({
        next: (v) => {
          this.vinculacion.set(v)
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }
}
