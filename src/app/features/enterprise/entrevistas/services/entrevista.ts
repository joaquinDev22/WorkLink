import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, tap, delay, catchError } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { EntrevistaRequestDTO, EntrevistaResponseDTO } from '../models/entrevista.models'
import { TokenStorage } from '../../../../core/auth/services/token-storage'

@Service()
export class EntrevistaService {
  readonly API_URL = `${environment.apiUrl}/recruiter/entrevistas`
  protected client = inject(HttpClient)
  private tokenStorage = inject(TokenStorage)

  readonly entrevistas = signal<EntrevistaResponseDTO[]>([])
  readonly isLoading = signal<boolean>(false)
  readonly isMutating = signal<boolean>(false)

  constructor() {
  }

  getEntrevistas(): Observable<EntrevistaResponseDTO[]> {
    this.isLoading.set(true)

    return this.client.get<EntrevistaResponseDTO[]>(this.API_URL).pipe(
      tap({
        next: (data) => {
          this.entrevistas.set(data || [])
          this.isLoading.set(false)
        },
        error: () => this.isLoading.set(false)
      }),
      catchError(() => {
        this.isLoading.set(false)
        return of(this.entrevistas())
      })
    )
  }

  crearEntrevista(
    datos: EntrevistaRequestDTO,
    candidatoInfo?: { candidateName: string; vacancyTitle: string; candidateEmail?: string }
  ): Observable<EntrevistaResponseDTO> {
    this.isMutating.set(true)

    const horaNormalizada = datos.hora && datos.hora.length === 5 ? `${datos.hora}:00` : datos.hora
    const payload: EntrevistaRequestDTO = { ...datos, hora: horaNormalizada }

    return this.client.post<EntrevistaResponseDTO>(this.API_URL, payload).pipe(
      tap({
        next: (res) => {
          this.entrevistas.update((prev) => [res, ...prev])
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }

  // PUT /api/v1/recruiter/entrevistas/{id} - cambia fecha, hora y link de una entrevista PROGRAMADA
  reprogramarEntrevista(id: number, datos: EntrevistaRequestDTO): Observable<EntrevistaResponseDTO> {
    this.isMutating.set(true)

    const horaNormalizada = datos.hora && datos.hora.length === 5 ? `${datos.hora}:00` : datos.hora
    const payload: EntrevistaRequestDTO = { ...datos, hora: horaNormalizada }

    return this.client.put<EntrevistaResponseDTO>(`${this.API_URL}/${id}`, payload).pipe(
      tap({
        next: (res) => {
          this.entrevistas.update((prev) => prev.map((e) => (e.id === id ? res : e)))
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }

  cancelarEntrevista(id: number): Observable<void> {
    this.isMutating.set(true)

    return this.client.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap({
        next: () => {
          this.entrevistas.update((prev) =>
            prev.map((e) => (e.id === id ? { ...e, status: 'CANCELADA' as const } : e))
          )
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }
}
