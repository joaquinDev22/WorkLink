import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, tap, delay, map } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { VacanteRequestDTO, VacanteResponseDTO } from '../models/vacante.models'

@Service()
export class VacanteService {
  readonly API_URL = `${environment.apiUrl}/vacantes`
  protected client = inject(HttpClient)

  readonly misVacantes = signal<VacanteResponseDTO[]>([])
  readonly catalogoVacantes = signal<VacanteResponseDTO[]>([])
  readonly isLoading = signal<boolean>(false)
  readonly isMutating = signal<boolean>(false)

  private readonly initialMockVacantes: VacanteResponseDTO[] = [
    {
      vacanteId: 201,
      uuid: 'vac-201-fe',
      puesto: 'Senior Frontend Engineer (Angular / TypeScript)',
      descripcion: 'Buscamos un desarrollador Frontend Senior con experiencia comprobable en Angular 18+, Signals y Tailwind CSS para liderar la arquitectura de nuestras plataformas cliente. Ofrecemos esquema 100% remoto, salario en USD y amplias oportunidades de crecimiento profesional.',
      publicacion: '2026-11-01',
      finalizacion: '2026-12-15',
      empresaId: 101,
      nombreEmpresa: 'InnovaCorp Technologies S.A.',
      ubicacion: 'Buenos Aires, Argentina (Remoto)',
      tipoUbicacion: 'REMOTO',
      tipoVacante: 'Full-time',
      salario: '$2.500 - $3.500 USD / mes',
      etiquetas: ['Angular', 'TypeScript', 'Tailwind CSS', 'Signals', 'RxJS']
    },
    {
      vacanteId: 202,
      uuid: 'vac-202-tl',
      puesto: 'Tech Lead Fullstack (Java Spring & Angular)',
      descripcion: 'Lidera un equipo interdisciplinario en el diseño de microservicios bancarios y arquitecturas distribuidas de alta disponibilidad. Buscamos experiencia sólida en Java 21, Spring Boot y microfrontends.',
      publicacion: '2026-11-03',
      finalizacion: '2026-12-30',
      empresaId: 101,
      nombreEmpresa: 'InnovaCorp Technologies S.A.',
      ubicacion: 'Buenos Aires, Argentina (Híbrido)',
      tipoUbicacion: 'HIBRIDO',
      tipoVacante: 'Full-time',
      salario: '$3.800 - $4.800 USD / mes',
      etiquetas: ['Java', 'Spring Boot', 'Angular', 'Docker', 'PostgreSQL', 'AWS']
    },
    {
      vacanteId: 203,
      uuid: 'vac-203-pd',
      puesto: 'Product Designer UI/UX Senior',
      descripcion: 'Responsable de la visión estética, design systems y research de usuario para nuestras aplicaciones móviles y web. Dominio avanzado de Figma, metodologías ágiles y principios de diseño premium.',
      publicacion: '2026-11-05',
      finalizacion: '2026-12-20',
      empresaId: 101,
      nombreEmpresa: 'InnovaCorp Technologies S.A.',
      ubicacion: 'Remoto LATAM',
      tipoUbicacion: 'REMOTO',
      tipoVacante: 'Full-time',
      salario: '$2.200 - $3.000 USD / mes',
      etiquetas: ['Figma', 'Design Systems', 'UX Research', 'UI Architecture', 'Prototyping']
    }
  ]

  // Carga las vacantes publicadas por la empresa autenticada (GET /api/v1/vacantes/me)
  getMisVacantes(): Observable<VacanteResponseDTO[]> {
    this.isLoading.set(true)

    if (environment.bypassAuth) {
      const list = this.misVacantes().length > 0 ? this.misVacantes() : this.initialMockVacantes
      return of(list).pipe(
        delay(200),
        tap((data) => {
          this.misVacantes.set(data)
          this.isLoading.set(false)
        })
      )
    }

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

  // Obtener detalle de una vacante por su ID (GET /api/v1/vacantes/{id})
  getVacanteById(id: number): Observable<VacanteResponseDTO | undefined> {
    if (environment.bypassAuth) {
      const list = this.misVacantes().length > 0 ? this.misVacantes() : this.initialMockVacantes
      const found = list.find((v) => v.vacanteId === id)
      return of(found).pipe(delay(150))
    }

    return this.client.get<VacanteResponseDTO>(`${this.API_URL}/${id}`)
  }

  // Publicar una nueva vacante laboral (POST /api/v1/vacantes/me)
  crearVacante(datos: VacanteRequestDTO): Observable<VacanteResponseDTO> {
    this.isMutating.set(true)

    if (environment.bypassAuth) {
      const nueva: VacanteResponseDTO = {
        vacanteId: Date.now(),
        uuid: `vac-${Date.now()}`,
        puesto: datos.puesto.trim(),
        descripcion: datos.descripcion.trim(),
        publicacion: new Date().toISOString().split('T')[0],
        finalizacion: datos.finalizacion,
        empresaId: datos.empresaId || 101,
        nombreEmpresa: 'InnovaCorp Technologies S.A.',
        ubicacion: datos.ubicacion || 'Remoto',
        tipoUbicacion: datos.tipoUbicacion || 'REMOTO',
        tipoVacante: datos.tipoVacante || 'Full-time',
        salario: datos.salario || 'A convenir',
        etiquetas: datos.etiquetas && datos.etiquetas.length > 0 ? datos.etiquetas : ['General']
      }

      return of(nueva).pipe(
        delay(250),
        tap((res) => {
          this.misVacantes.update((prev) => [res, ...prev])
          this.isMutating.set(false)
        })
      )
    }

    return this.client.post<VacanteResponseDTO>(`${this.API_URL}/me`, datos).pipe(
      tap({
        next: (res) => {
          this.misVacantes.update((prev) => [res, ...prev])
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }

  // Editar vacante existente (PUT /api/v1/vacantes/{id})
  actualizarVacante(id: number, datos: VacanteRequestDTO): Observable<VacanteResponseDTO> {
    this.isMutating.set(true)

    if (environment.bypassAuth) {
      const actual = this.misVacantes().find((v) => v.vacanteId === id)
      const actualizada: VacanteResponseDTO = {
        vacanteId: id,
        uuid: actual?.uuid || `vac-${id}`,
        puesto: datos.puesto.trim(),
        descripcion: datos.descripcion.trim(),
        publicacion: actual?.publicacion || new Date().toISOString().split('T')[0],
        finalizacion: datos.finalizacion,
        empresaId: actual?.empresaId || 101,
        nombreEmpresa: actual?.nombreEmpresa || 'InnovaCorp Technologies S.A.',
        ubicacion: datos.ubicacion || actual?.ubicacion || 'Remoto',
        tipoUbicacion: datos.tipoUbicacion || actual?.tipoUbicacion || 'REMOTO',
        tipoVacante: datos.tipoVacante || actual?.tipoVacante || 'Full-time',
        salario: datos.salario || actual?.salario || 'A convenir',
        etiquetas: datos.etiquetas || actual?.etiquetas || []
      }

      return of(actualizada).pipe(
        delay(250),
        tap((res) => {
          this.misVacantes.update((prev) => prev.map((v) => v.vacanteId === id ? res : v))
          this.isMutating.set(false)
        })
      )
    }

    return this.client.put<VacanteResponseDTO>(`${this.API_URL}/${id}`, datos).pipe(
      tap({
        next: (res) => {
          this.misVacantes.update((prev) => prev.map((v) => v.vacanteId === id ? res : v))
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }

  // Dar de baja / eliminar vacante (DELETE /api/v1/vacantes/{id})
  eliminarVacante(id: number): Observable<void> {
    this.isMutating.set(true)

    if (environment.bypassAuth) {
      return of(undefined).pipe(
        delay(200),
        tap(() => {
          this.misVacantes.update((prev) => prev.filter((v) => v.vacanteId !== id))
          this.isMutating.set(false)
        })
      )
    }

    return this.client.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap({
        next: () => {
          this.misVacantes.update((prev) => prev.filter((v) => v.vacanteId !== id))
          this.isMutating.set(false)
        },
        error: () => this.isMutating.set(false)
      })
    )
  }
}
