import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { delay, finalize, Observable, of, tap } from 'rxjs'
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

  private readonly mockProyectosAsignados: ProyectoResponseDTO[] = [
    {
      proyectoId: 101,
      uuid: 'proj-fl-001',
      nombreProyecto: 'E-Commerce SSR con Angular & Stripe',
      area: 'Frontend',
      descripcion:
        'Desarrollo integral de plataforma de venta online con arquitectura de componentes Standalone y Signals reactivas.',
      fechaPublicacion: '2026-10-15',
      presupuestoMin: 800,
      presupuestoMax: 1400,
      clienteId: 5,
      nombreCliente: 'InnovaCorp Technologies S.A.',
      duracion: '1 mes',
      tipoPago: 'Por Hitos',
      habilidades: ['Angular', 'TypeScript', 'Tailwind CSS', 'Stripe'],
      estado: 'FINALIZADO',
      nombreFreelancer: 'Joaquín Nieva'
    },
    {
      proyectoId: 103,
      uuid: 'proj-fl-003',
      nombreProyecto: 'Dashboard Analítico en Tiempo Real',
      area: 'Frontend',
      descripcion:
        'Visualización interactiva de métricas empresariales con gráficos dinámicos y sincronización por WebSockets.',
      fechaPublicacion: '2026-11-01',
      presupuestoMin: 900,
      presupuestoMax: 1300,
      clienteId: 9,
      nombreCliente: 'DataPeak Analytics',
      duracion: '3 semanas',
      tipoPago: 'Por Hitos',
      habilidades: ['Angular', 'RxJS', 'Chart.js', 'Tailwind CSS'],
      estado: 'EN_PROGRESO',
      nombreFreelancer: 'Joaquín Nieva'
    }
  ]

  // GET /api/v1/freelance/proyectos/me/publicados - Proyectos del cliente autenticado
  getMisProyectosPublicados(): Observable<ProyectoResponseDTO[]> {
    this.isLoading.set(true)
    if (environment.bypassAuth) {
      const publicados: ProyectoResponseDTO[] = [
        {
          proyectoId: 1,
          uuid: '11111111-1111-4111-8111-111111111101',
          nombreProyecto: 'Arquitectura Frontend Angular 21 para Fintech B2B',
          area: 'Desarrollo Web',
          descripcion: 'Migración de panel de tesorería a Signals con WCAG AA.',
          fechaPublicacion: '2026-11-05',
          presupuestoMin: 1800,
          presupuestoMax: 3200,
          clienteId: 12,
          nombreCliente: 'Lucía Fernández',
          duracion: '1 a 3 meses',
          tipoPago: 'Por Hitos',
          habilidades: ['Angular', 'TypeScript', 'Tailwind CSS'],
          estado: 'BUSCANDO_TALENTO'
        },
        {
          proyectoId: 103,
          uuid: 'proj-fl-003',
          nombreProyecto: 'Dashboard Analítico en Tiempo Real',
          area: 'Frontend',
          descripcion: 'Visualización interactiva de métricas empresariales.',
          fechaPublicacion: '2026-11-01',
          presupuestoMin: 900,
          presupuestoMax: 1300,
          clienteId: 12,
          nombreCliente: 'Lucía Fernández',
          duracion: '3 semanas',
          tipoPago: 'Por Hitos',
          habilidades: ['Angular', 'RxJS', 'Tailwind CSS'],
          estado: 'EN_PROGRESO',
          nombreFreelancer: 'Valentina Gómez'
        }
      ]
      return of(publicados).pipe(
        delay(200),
        tap((data) => this.misProyectos.set(data)),
        finalize(() => this.isLoading.set(false))
      )
    }

    return this.client.get<ProyectoResponseDTO[]>(`${this.API_URL}/me/publicados`).pipe(
      tap((data) => this.misProyectos.set(Array.isArray(data) ? data : [])),
      finalize(() => this.isLoading.set(false))
    )
  }

  // GET /api/v1/freelance/proyectos/me/asignados - Proyectos del freelancer autenticado
  getMisProyectosAsignados(): Observable<ProyectoResponseDTO[]> {
    this.isLoading.set(true)
    if (environment.bypassAuth) {
      return of(this.mockProyectosAsignados).pipe(
        delay(200),
        tap((data) => this.misProyectos.set(data)),
        finalize(() => this.isLoading.set(false))
      )
    }

    // Evita 403 si otro rol consulta su perfil sin JWT de FREELANCER
    const tokenRol = this.tokenStorage.getJwtRol()
    if (tokenRol && tokenRol !== 'FREELANCER') {
      this.misProyectos.set([])
      this.isLoading.set(false)
      return of([])
    }

    return this.client.get<ProyectoResponseDTO[]>(`${this.API_URL}/me/asignados`).pipe(
      tap((data) => this.misProyectos.set(Array.isArray(data) ? data : [])),
      finalize(() => this.isLoading.set(false))
    )
  }

  // POST /api/v1/freelance/proyectos/me - Publicar nuevo proyecto freelance
  publicarProyecto(datos: ProyectoRequestDTO): Observable<ProyectoResponseDTO> {
    this.isMutating.set(true)
    if (environment.bypassAuth) {
      const nuevo: ProyectoResponseDTO = {
        proyectoId: Math.floor(Math.random() * 1000) + 200,
        uuid: crypto.randomUUID(),
        nombreProyecto: datos.nombreProyecto,
        area: datos.area,
        descripcion: datos.descripcion,
        fechaPublicacion: new Date().toISOString().split('T')[0],
        presupuestoMin: datos.presupuestoMin,
        presupuestoMax: datos.presupuestoMax,
        clienteId: 12,
        nombreCliente: 'Lucía Fernández',
        duracion: datos.duracion,
        tipoPago: datos.tipoPago,
        habilidades: datos.habilidades ?? [],
        estado: 'BUSCANDO_TALENTO'
      }
      return of(nuevo).pipe(
        delay(250),
        finalize(() => this.isMutating.set(false))
      )
    }

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
    if (environment.bypassAuth) {
      return of({
        ...this.mockProyectosAsignados[1],
        proyectoId,
        estado: 'EN_PROGRESO',
        nombreFreelancer: 'Valentina Gómez'
      } as ProyectoResponseDTO).pipe(
        delay(250),
        finalize(() => this.isMutating.set(false))
      )
    }

    return this.client
      .put<ProyectoResponseDTO>(`${this.API_URL}/${proyectoId}/asignar`, null, {
        params: { employeeId: employeeId.toString() }
      })
      .pipe(finalize(() => this.isMutating.set(false)))
  }

  // PUT /api/v1/freelance/proyectos/{id}/cancelar - Cancelar proyecto
  cancelarProyecto(proyectoId: number): Observable<void> {
    this.isMutating.set(true)
    if (environment.bypassAuth) {
      return of(void 0).pipe(
        delay(200),
        finalize(() => this.isMutating.set(false))
      )
    }

    return this.client
      .put<void>(`${this.API_URL}/${proyectoId}/cancelar`, null)
      .pipe(finalize(() => this.isMutating.set(false)))
  }

  // GET /api/v1/freelance/proyectos/{proyectoId}/hitos - Lista de hitos
  getHitos(proyectoId: number): Observable<HitoResponseDTO[]> {
    if (environment.bypassAuth) {
      const mockHitos: HitoResponseDTO[] = [
        {
          hitoId: 11,
          titulo: 'Diseño de arquitectura y setup inicial',
          descripcion: 'Configuración de módulos standalone, guards y tokens.',
          monto: 450,
          fechaLimite: '2026-11-18',
          estado: 'PAGADO',
          proyectoId
        },
        {
          hitoId: 12,
          titulo: 'Implementación de vistas e integración REST',
          descripcion: 'Conexión completa con backend y estados vacíos/carga.',
          monto: 650,
          fechaLimite: '2026-11-28',
          estado: 'COMPLETADO',
          proyectoId
        }
      ]
      return of(mockHitos).pipe(delay(150))
    }

    return this.client.get<HitoResponseDTO[]>(`${this.API_URL}/${proyectoId}/hitos`)
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/hitos - Crear hito
  crearHito(proyectoId: number, datos: HitoRequestDTO): Observable<HitoResponseDTO> {
    this.isMutating.set(true)
    if (environment.bypassAuth) {
      return of({
        hitoId: Math.floor(Math.random() * 1000) + 20,
        ...datos,
        estado: 'PENDIENTE' as EstadoHito,
        proyectoId
      }).pipe(
        delay(200),
        finalize(() => this.isMutating.set(false))
      )
    }

    return this.client
      .post<HitoResponseDTO>(`${this.API_URL}/${proyectoId}/hitos`, datos)
      .pipe(finalize(() => this.isMutating.set(false)))
  }

  // PUT /api/v1/freelance/proyectos/{proyectoId}/hitos/{hitoId}/estado?nuevoEstado=PENDIENTE|COMPLETADO|PAGADO
  actualizarEstadoHito(
    proyectoId: number,
    hitoId: number,
    nuevoEstado: EstadoHito
  ): Observable<void> {
    this.isMutating.set(true)
    if (environment.bypassAuth) {
      return of(void 0).pipe(
        delay(200),
        finalize(() => this.isMutating.set(false))
      )
    }

    return this.client
      .put<void>(`${this.API_URL}/${proyectoId}/hitos/${hitoId}/estado`, null, {
        params: { nuevoEstado }
      })
      .pipe(finalize(() => this.isMutating.set(false)))
  }
}
