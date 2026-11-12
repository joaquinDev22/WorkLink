import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { delay, finalize, Observable, of, tap } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import {
  CalificacionProyectoRequestDTO,
  CalificacionProyectoResponseDTO,
  PostulacionProyectoRequestDTO,
  PostulacionProyectoResponseDTO,
  ProyectoResponseDTO
} from '../../proyecto-gestion/models/proyecto.models'

@Service()
export class ProyectoCatalog {
  readonly API_URL = `${environment.apiUrl}/freelance/proyectos`
  protected client = inject(HttpClient)

  readonly proyectos = signal<ProyectoResponseDTO[]>([])
  readonly isLoading = signal<boolean>(false)
  readonly isMutating = signal<boolean>(false)

  private readonly mockProyectos: ProyectoResponseDTO[] = [
    {
      proyectoId: 1,
      uuid: '11111111-1111-4111-8111-111111111101',
      nombreProyecto: 'Arquitectura Frontend Angular 21 para Fintech B2B',
      area: 'Desarrollo Web',
      descripcion:
        'Necesitamos migrar nuestro panel de tesorería a Angular Signals con Tailwind CSS v4, diseño accesible WCAG AA y gráficos de flujo de caja en tiempo real consumiendo nuestra API REST.',
      fechaPublicacion: '2026-11-05',
      presupuestoMin: 1800,
      presupuestoMax: 3200,
      clienteId: 12,
      nombreCliente: 'NortePay S.A.',
      duracion: '1 a 3 meses',
      tipoPago: 'Por Hitos',
      habilidades: ['Angular', 'TypeScript', 'Tailwind CSS', 'RxJS'],
      estado: 'BUSCANDO_TALENTO'
    },
    {
      proyectoId: 2,
      uuid: '11111111-1111-4111-8111-111111111102',
      nombreProyecto: 'Microservicio de Facturación AFIP con Spring Boot 3',
      area: 'Backend & APIs',
      descripcion:
        'Integración con webservices WSFE de AFIP en Java 21 + Spring Boot, generación de comprobantes PDF, reintentos idempotentes y documentación OpenAPI.',
      fechaPublicacion: '2026-11-08',
      presupuestoMin: 1200,
      presupuestoMax: 2100,
      clienteId: 14,
      nombreCliente: 'Estudio Contable Prisma',
      duracion: 'Menos de 1 mes',
      tipoPago: 'Precio Fijo',
      habilidades: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
      estado: 'BUSCANDO_TALENTO'
    },
    {
      proyectoId: 3,
      uuid: '11111111-1111-4111-8111-111111111103',
      nombreProyecto: 'Sistema de Diseño y Auditoría UX para App Logística',
      area: 'Diseño UX/UI',
      descripcion:
        'Definición de design tokens en Figma, librería de componentes accesibles y prototipo interactivo de seguimiento de flotas y remitos digitales.',
      fechaPublicacion: '2026-11-02',
      presupuestoMin: 750,
      presupuestoMax: 1400,
      clienteId: 19,
      nombreCliente: 'RutaSur Logística',
      duracion: 'Menos de 1 mes',
      tipoPago: 'Por Hitos',
      habilidades: ['Figma', 'Design Systems', 'Accesibilidad'],
      estado: 'BUSCANDO_TALENTO'
    }
  ]

  // GET /api/v1/freelance/proyectos - Público. Feed de proyectos freelance
  getProyectos(): Observable<ProyectoResponseDTO[]> {
    this.isLoading.set(true)
    if (environment.bypassAuth) {
      return of(this.mockProyectos).pipe(
        delay(200),
        tap((data) => this.proyectos.set(data)),
        finalize(() => this.isLoading.set(false))
      )
    }

    return this.client.get<ProyectoResponseDTO[]>(this.API_URL).pipe(
      tap((data) => this.proyectos.set(Array.isArray(data) ? data : [])),
      finalize(() => this.isLoading.set(false))
    )
  }

  // GET /api/v1/freelance/proyectos/{id} o /uuid/{uuid} - Público. Detalle de proyecto
  getProyectoById(idOrUuid: number | string): Observable<ProyectoResponseDTO> {
    if (environment.bypassAuth) {
      const mockExtras: ProyectoResponseDTO[] = [
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
          habilidades: ['Angular', 'TypeScript', 'Tailwind CSS'],
          estado: 'FINALIZADO',
          nombreFreelancer: 'Joaquín Nieva'
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
      const found = [...this.mockProyectos, ...mockExtras].find(
        (p) => p.uuid === String(idOrUuid) || String(p.proyectoId) === String(idOrUuid)
      )
      return of(found ?? this.mockProyectos[0]).pipe(delay(150))
    }

    const raw = String(idOrUuid).trim()
    const path = raw.startsWith('uuid/') || /^\d+$/.test(raw) ? raw : `uuid/${raw}`
    return this.client.get<ProyectoResponseDTO>(`${this.API_URL}/${path}`)
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/postulaciones/me - Postulación con usuario autenticado
  postularseAProyecto(
    proyectoId: number,
    datos: PostulacionProyectoRequestDTO
  ): Observable<PostulacionProyectoResponseDTO> {
    this.isMutating.set(true)
    if (environment.bypassAuth) {
      const mockResp: PostulacionProyectoResponseDTO = {
        postulacionId: Math.floor(Math.random() * 1000) + 10,
        descripcion: datos.descripcion,
        costoPropuesto: datos.costo,
        fechaPostulacion: new Date().toISOString().split('T')[0],
        estado: 'ENVIADA',
        empleadoId: datos.employeeId || 300,
        nombreEmpleado: 'Freelancer Dev',
        proyectoId
      }
      return of(mockResp).pipe(
        delay(300),
        finalize(() => this.isMutating.set(false))
      )
    }

    return this.client
      .post<PostulacionProyectoResponseDTO>(`${this.API_URL}/${proyectoId}/postulaciones/me`, datos)
      .pipe(finalize(() => this.isMutating.set(false)))
  }

  // GET /api/v1/freelance/proyectos/{proyectoId}/postulaciones - Propuestas enviadas
  getPostulaciones(proyectoId: number): Observable<PostulacionProyectoResponseDTO[]> {
    if (environment.bypassAuth) {
      return of([
        {
          postulacionId: 501,
          descripcion:
            'Tengo 5 años liderando migraciones a Angular Signals y arquitectura limpia. Puedo entregar un MVP en 2 semanas con cobertura de pruebas.',
          costoPropuesto: 2300,
          fechaPostulacion: '2026-11-09',
          estado: 'ENVIADA',
          empleadoId: 301,
          nombreEmpleado: 'Valentina Gómez',
          proyectoId
        },
        {
          postulacionId: 502,
          descripcion:
            'Especialista Frontend y Design Systems. Ya implementé tableros financieros con WCAG AA y animaciones GSAP de alto rendimiento.',
          costoPropuesto: 2650,
          fechaPostulacion: '2026-11-10',
          estado: 'ENVIADA',
          empleadoId: 302,
          nombreEmpleado: 'Martín Herrera',
          proyectoId
        }
      ]).pipe(delay(200))
    }

    return this.client.get<PostulacionProyectoResponseDTO[]>(
      `${this.API_URL}/${proyectoId}/postulaciones`
    )
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/calificar - Reseñar proyecto
  calificarProyecto(
    proyectoId: number,
    datos: CalificacionProyectoRequestDTO
  ): Observable<CalificacionProyectoResponseDTO> {
    this.isMutating.set(true)
    if (environment.bypassAuth) {
      return of({
        calificacionId: 901,
        puntaje: datos.puntaje,
        comentario: datos.comentario,
        fechaComentario: new Date().toISOString().split('T')[0],
        proyectoId
      }).pipe(
        delay(250),
        finalize(() => this.isMutating.set(false))
      )
    }

    return this.client
      .post<CalificacionProyectoResponseDTO>(`${this.API_URL}/${proyectoId}/calificar`, datos)
      .pipe(finalize(() => this.isMutating.set(false)))
  }

  // GET /api/v1/freelance/proyectos/{proyectoId}/calificaciones - Reseñas del proyecto
  getCalificaciones(proyectoId: number): Observable<CalificacionProyectoResponseDTO[]> {
    if (environment.bypassAuth) {
      return of([]).pipe(delay(120))
    }

    return this.client.get<CalificacionProyectoResponseDTO[]>(
      `${this.API_URL}/${proyectoId}/calificaciones`
    )
  }
}
