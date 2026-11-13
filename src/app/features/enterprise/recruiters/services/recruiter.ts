import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, tap, delay } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { RecruiterRequestDTO, RecruiterResponseDTO } from '../models/recruiter.models'

@Service()
export class RecruiterService {
  readonly API_URL = `${environment.apiUrl}/empresas/recruiters`
  protected client = inject(HttpClient)

  readonly recruiters = signal<RecruiterResponseDTO[]>([])
  readonly isLoading = signal<boolean>(false)
  readonly isMutating = signal<boolean>(false)

  // Obtener nómina de reclutadores asociados a la empresa
  getRecruiters(): Observable<RecruiterResponseDTO[]> {
    this.isLoading.set(true)

    return this.client.get<RecruiterResponseDTO[]>(this.API_URL).pipe(
      tap({
        next: (data) => {
          this.recruiters.set(data || [])
          this.isLoading.set(false)
        },
        error: () => this.isLoading.set(false)
      })
    )
  }

  // Dar de alta un nuevo recruiter en la organización (POST /api/v1/empresas/recruiters)
  crearRecruiter(datos: RecruiterRequestDTO): Observable<RecruiterResponseDTO> {
    this.isMutating.set(true)

    return this.client.post<RecruiterResponseDTO>(this.API_URL, datos).pipe(
      tap({
        next: (recruiter) => {
          this.recruiters.update((prev) => [recruiter, ...prev])
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }

  // Dar de baja a un recruiter (DELETE /api/v1/empresas/recruiters/{id})
  eliminarRecruiter(id: number): Observable<void> {
    this.isMutating.set(true)

    return this.client.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap({
        next: () => {
          this.recruiters.update((prev) => prev.filter((r) => r.recruiterId !== id))
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }
}
