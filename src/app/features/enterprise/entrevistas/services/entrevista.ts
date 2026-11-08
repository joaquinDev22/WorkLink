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

  private readonly initialMockEntrevistas: EntrevistaResponseDTO[] = [
    {
      id: 801,
      postulacionId: 503,
      candidateName: 'Ignacio Rossi',
      candidateEmail: 'ignacio.rossi@dev.com',
      vacancyTitle: 'Tech Lead Fullstack (Java Spring & Angular)',
      companyName: 'InnovaCorp Technologies S.A.',
      date: '2026-11-10',
      time: '10:30',
      link: 'https://meet.google.com/xyz-work-link',
      notas: 'Evaluación de arquitectura técnica: microservicios con Spring Boot, patrones de resiliencia y microfrontends.',
      status: 'PROGRAMADA'
    },
    {
      id: 802,
      postulacionId: 500,
      candidateName: 'Joaquín Nieva (Tú)',
      candidateEmail: 'joaquin.postulante@worklink.dev',
      vacancyTitle: 'Senior Frontend Engineer (Angular / TypeScript)',
      companyName: 'InnovaCorp Technologies S.A.',
      date: '2026-11-11',
      time: '16:00',
      link: 'https://meet.google.com/qwe-work-tech',
      notas: 'Entrevista técnica sobre Angular 18+, Signals reactivas, Core Web Vitals y diseño de sistemas táctiles.',
      status: 'PROGRAMADA'
    }
  ]

  constructor() {
    if (environment.bypassAuth) {
      this.entrevistas.set(this.initialMockEntrevistas)
    }
  }

  getEntrevistas(): Observable<EntrevistaResponseDTO[]> {
    this.isLoading.set(true)

    const session = this.tokenStorage.getSession()
    const esRecruiterOEmpresa = session?.rol === 'RECRUITER' || session?.rol === 'EMPRESA'

    // Si es POSTULANTE o modo bypass, no invocamos la ruta exclusiva /api/v1/recruiter/entrevistas (403 Forbidden).
    // Usamos la agenda propia del postulante / estado mock seguro.
    if (!esRecruiterOEmpresa || environment.bypassAuth) {
      const list = this.entrevistas().length > 0 ? this.entrevistas() : this.initialMockEntrevistas
      this.entrevistas.set(list)
      this.isLoading.set(false)
      return of(list)
    }

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

    if (environment.bypassAuth) {
      const nueva: EntrevistaResponseDTO = {
        id: Date.now(),
        postulacionId: datos.postulacionId,
        candidateName: candidatoInfo?.candidateName || 'Candidato Seleccionado',
        candidateEmail: candidatoInfo?.candidateEmail || 'candidato@worklink.dev',
        vacancyTitle: candidatoInfo?.vacancyTitle || 'Posición Laboral',
        companyName: 'InnovaCorp Technologies S.A.',
        date: datos.fecha,
        time: datos.hora,
        link: datos.link?.trim() || `https://meet.google.com/wlk-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`,
        notas: datos.notas?.trim() || 'Entrevista técnica y de encuadre cultural.',
        status: 'PROGRAMADA'
      }

      return of(nueva).pipe(
        delay(250),
        tap((res) => {
          this.entrevistas.update((prev) => [res, ...prev])
          this.isMutating.set(false)
        })
      )
    }

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

  cancelarEntrevista(id: number): Observable<void> {
    this.isMutating.set(true)

    if (environment.bypassAuth) {
      return of(undefined).pipe(
        delay(200),
        tap(() => {
          this.entrevistas.update((prev) =>
            prev.map((e) => (e.id === id ? { ...e, status: 'CANCELADA' as const } : e))
          )
          this.isMutating.set(false)
        })
      )
    }

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
