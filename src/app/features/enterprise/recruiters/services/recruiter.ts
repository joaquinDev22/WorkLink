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

    if (environment.bypassAuth) {
      const mockList: RecruiterResponseDTO[] = this.recruiters().length > 0 
        ? this.recruiters() 
        : [
            {
              recruiterId: 101,
              nombre: 'Lucía',
              apellido: 'Fernández',
              email: 'lucia.fernandez@innovacorp.com',
              fechaNacimiento: '1992-06-14',
              area: 'Tecnología e Innovación',
              empresaId: 101,
              nombreEmpresa: 'InnovaCorp Technologies S.A.'
            },
            {
              recruiterId: 102,
              nombre: 'Martín',
              apellido: 'Gómez',
              email: 'martin.gomez@innovacorp.com',
              fechaNacimiento: '1988-11-23',
              area: 'People & Talent Acquisition',
              empresaId: 101,
              nombreEmpresa: 'InnovaCorp Technologies S.A.'
            },
            {
              recruiterId: 103,
              nombre: 'Valentina',
              apellido: 'Rossi',
              email: 'valentina.rossi@innovacorp.com',
              fechaNacimiento: '1995-03-08',
              area: 'Operaciones y Ventas',
              empresaId: 101,
              nombreEmpresa: 'InnovaCorp Technologies S.A.'
            }
          ]

      return of(mockList).pipe(
        delay(200),
        tap((data) => {
          this.recruiters.set(data)
          this.isLoading.set(false)
        })
      )
    }

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

    if (environment.bypassAuth) {
      const nuevo: RecruiterResponseDTO = {
        recruiterId: Date.now(),
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        email: datos.email.trim().toLowerCase(),
        fechaNacimiento: datos.fechaNacimiento,
        area: datos.area?.trim() || 'General',
        empresaId: 101,
        nombreEmpresa: 'InnovaCorp Technologies S.A.'
      }

      return of(nuevo).pipe(
        delay(250),
        tap((recruiter) => {
          this.recruiters.update((prev) => [recruiter, ...prev])
          this.isMutating.set(false)
        })
      )
    }

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

    if (environment.bypassAuth) {
      return of(undefined).pipe(
        delay(200),
        tap(() => {
          this.recruiters.update((prev) => prev.filter((r) => r.recruiterId !== id))
          this.isMutating.set(false)
        })
      )
    }

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
