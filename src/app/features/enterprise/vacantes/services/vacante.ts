import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, tap, delay, throwError, catchError } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { EstadoPostulacion, PostulacionResponseDTO, VacanteRequestDTO, VacanteResponseDTO } from '../models/vacante.models'

@Service()
export class VacanteService {
  readonly API_URL = `${environment.apiUrl}/vacantes`
  protected client = inject(HttpClient)

  readonly misVacantes = signal<VacanteResponseDTO[]>([])
  readonly catalogoVacantes = signal<VacanteResponseDTO[]>([])
  readonly postulaciones = signal<PostulacionResponseDTO[]>([])
  readonly misPostulacionesIds = signal<number[]>([])
  readonly isLoading = signal<boolean>(false)
  readonly isMutating = signal<boolean>(false)

  constructor() {
  }

  // Carga las vacantes publicadas por la empresa autenticada (GET /api/v1/vacantes/me)
  getMisVacantes(): Observable<VacanteResponseDTO[]> {
    this.isLoading.set(true)

    return this.client.get<VacanteResponseDTO[]>(`${this.API_URL}/me`).pipe(
      tap({
        next: (data) => {
          this.misVacantes.set(data || [])
          this.isLoading.set(false)
        },
        error: () => this.isLoading.set(false)
      })
    )
  }

  // Feed público / catálogo general de vacantes (GET /api/v1/vacantes)
  getCatalogoVacantes(): Observable<VacanteResponseDTO[]> {
    this.isLoading.set(true)

    return this.client.get<VacanteResponseDTO[]>(this.API_URL).pipe(
      tap({
        next: (data) => {
          this.catalogoVacantes.set(data || [])
          this.isLoading.set(false)
        },
        error: () => this.isLoading.set(false)
      })
    )
  }

  // Obtener detalle de una vacante por su ID (GET /api/v1/vacantes/{id})
  getVacanteById(id: number): Observable<VacanteResponseDTO | undefined> {
    return this.client.get<VacanteResponseDTO>(`${this.API_URL}/${id}`)
  }

  // Publicar una nueva vacante laboral (POST /api/v1/vacantes/me)
  crearVacante(datos: VacanteRequestDTO): Observable<VacanteResponseDTO> {
    this.isMutating.set(true)

    return this.client.post<VacanteResponseDTO>(`${this.API_URL}/me`, datos).pipe(
      tap({
        next: (res) => {
          this.misVacantes.update((prev) => [res, ...prev])
          this.catalogoVacantes.update((prev) => [res, ...prev])
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }

  // Editar vacante existente (PUT /api/v1/vacantes/{id})
  actualizarVacante(id: number, datos: VacanteRequestDTO): Observable<VacanteResponseDTO> {
    this.isMutating.set(true)

    return this.client.put<VacanteResponseDTO>(`${this.API_URL}/${id}`, datos).pipe(
      tap({
        next: (res) => {
          this.misVacantes.update((prev) => prev.map((v) => v.vacanteId === id ? res : v))
          this.catalogoVacantes.update((prev) => prev.map((v) => v.vacanteId === id ? res : v))
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }

  // Dar de baja / eliminar vacante (DELETE /api/v1/vacantes/{id})
  eliminarVacante(id: number): Observable<void> {
    this.isMutating.set(true)

    return this.client.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap({
        next: () => {
          this.misVacantes.update((prev) => prev.filter((v) => v.vacanteId !== id))
          this.catalogoVacantes.update((prev) => prev.filter((v) => v.vacanteId !== id))
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }

  // Verificar si el postulante actual ya aplicó a una vacante
  yaPostulado(vacanteId: number): boolean {
    return this.misPostulacionesIds().includes(vacanteId) ||
      this.postulaciones().some((p) => p.vacanteId === vacanteId && (p.employeeId === 300 || p.nombreCandidato.includes('(Tú)')))
  }

  // Diálogo de postulación / enviar candidatura (POST /api/v1/vacantes/{id}/postulaciones/me)
  postularse(vacanteId: number, mensaje: string, cvFile?: File): Observable<PostulacionResponseDTO> {
    this.isMutating.set(true)

    // Validar si ya se encuentra postulado (Escenario 2 - Gherkin WL-25)
    if (this.yaPostulado(vacanteId)) {
      this.isMutating.set(false)
      return throwError(() => ({
        status: 400,
        error: { message: 'Ya registras una postulación previa a esta búsqueda laboral.' }
      }))
    }

    const formData = new FormData()
    formData.append('mensaje', mensaje.trim())
    if (cvFile) {
      formData.append('cv', cvFile)
    }

    return this.client.post<PostulacionResponseDTO>(`${this.API_URL}/${vacanteId}/postulaciones/me`, formData).pipe(
      tap({
        next: (res) => {
          this.postulaciones.update((prev) => [res, ...prev])
          this.misPostulacionesIds.update((prev) => [...prev, vacanteId])
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }

  // Obtener postulaciones por vacante (GET /api/v1/vacantes/{id}/postulaciones)
  getPostulacionesPorVacante(vacanteId?: number): Observable<PostulacionResponseDTO[]> {
    this.isLoading.set(true)

    const endpoint = vacanteId
      ? `${this.API_URL}/${vacanteId}/postulaciones`
      : `${this.API_URL}/postulaciones`

    return this.client.get<PostulacionResponseDTO[]>(endpoint).pipe(
      tap({
        next: (data) => {
          if (data) this.postulaciones.set(data)
          this.isLoading.set(false)
        },
        error: () => this.isLoading.set(false)
      }),
      catchError(() => {
        this.isLoading.set(false)
        return of([])
      })
    )
  }

  // Modificar estado del postulante (PUT /api/v1/vacantes/{vacanteId}/postulaciones/{postulacionId}/estado?nuevoEstado={ESTADO})
  actualizarEstadoPostulacion(
    vacanteId: number,
    postulacionId: number,
    nuevoEstado: EstadoPostulacion
  ): Observable<PostulacionResponseDTO> {
    this.isMutating.set(true)

    return this.client
      .put<PostulacionResponseDTO>(
        `${this.API_URL}/${vacanteId}/postulaciones/${postulacionId}/estado?nuevoEstado=${nuevoEstado}`,
        {}
      )
      .pipe(
        tap({
          next: (res) => {
            this.postulaciones.update((prev) =>
              prev.map((p) => (p.postulacionId === postulacionId ? res : p))
            )
            this.isMutating.set(false)
          },
          error: () => this.isMutating.set(false)
        })
      )
  }

  // Descargar CV de un postulante en formato binario PDF
  descargarCv(employeeId: number): Observable<Blob> {
    return this.client.get(`${this.API_URL}/postulaciones/${employeeId}/cv`, { responseType: 'blob' })
  }
}
