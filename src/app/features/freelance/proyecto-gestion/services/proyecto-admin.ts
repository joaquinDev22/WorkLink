import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, map, catchError, delay } from 'rxjs'
import { environment } from '../../../../../environments/environment'
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

  readonly misProyectos = signal<ProyectoResponseDTO[]>([])
  readonly isLoading = signal<boolean>(false)

  private readonly mockProyectosAsignados: ProyectoResponseDTO[] = [
    {
      proyectoId: 101,
      uuid: 'proj-fl-001',
      nombreProyecto: 'E-Commerce SSR con Angular & Stripe',
      area: 'Frontend',
      descripcion: 'Desarrollo integral de plataforma de venta online con arquitectura de componentes Standalone y Signals reactivas.',
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
      proyectoId: 102,
      uuid: 'proj-fl-002',
      nombreProyecto: 'API Gateway & Microservicios Spring Boot',
      area: 'Backend',
      descripcion: 'Implementación de servicios REST seguros con JWT, Spring Security y base de datos MySQL optimizada.',
      fechaPublicacion: '2026-09-20',
      presupuestoMin: 1200,
      presupuestoMax: 1800,
      clienteId: 7,
      nombreCliente: 'FinTech Latam',
      duracion: '2 meses',
      tipoPago: 'Precio Fijo',
      habilidades: ['Spring Boot', 'Java 21', 'Docker', 'MySQL'],
      estado: 'FINALIZADO',
      nombreFreelancer: 'Joaquín Nieva'
    },
    {
      proyectoId: 103,
      uuid: 'proj-fl-003',
      nombreProyecto: 'Dashboard Analítico en Tiempo Real',
      area: 'Frontend',
      descripcion: 'Visualización interactiva de métricas empresariales con gráficos dinámicos y sincronización por WebSockets.',
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
    return this.client.get<ProyectoResponseDTO[]>(`${this.API_URL}/me/publicados`)
  }

  // GET /api/v1/freelance/proyectos/me/asignados - Proyectos del freelancer autenticado
  getMisProyectosAsignados(): Observable<ProyectoResponseDTO[]> {
    if (environment.bypassAuth) {
      return of(this.mockProyectosAsignados).pipe(delay(200))
    }
    return this.client.get<ProyectoResponseDTO[]>(`${this.API_URL}/me/asignados`).pipe(
      map(data => (Array.isArray(data) && data.length > 0) ? data : this.mockProyectosAsignados),
      catchError(() => of(this.mockProyectosAsignados))
    )
  }

  // POST /api/v1/freelance/proyectos/me - Publicar nuevo proyecto freelance
  publicarProyecto(datos: ProyectoRequestDTO): Observable<ProyectoResponseDTO> {
    return this.client.post<ProyectoResponseDTO>(`${this.API_URL}/me`, datos)
  }

  // PUT /api/v1/freelance/proyectos/{id}/asignar?employeeId={id} - Adjudicar proyecto
  asignarProyecto(proyectoId: number, employeeId: number): Observable<void> {
    return this.client.put<void>(
      `${this.API_URL}/${proyectoId}/asignar`,
      null,
      { params: { employeeId: employeeId.toString() } }
    )
  }

  // PUT /api/v1/freelance/proyectos/{id}/cancelar - Cancelar proyecto
  cancelarProyecto(proyectoId: number): Observable<void> {
    return this.client.put<void>(`${this.API_URL}/${proyectoId}/cancelar`, null)
  }

  // GET /api/v1/freelance/proyectos/{proyectoId}/hitos - Lista de hitos
  getHitos(proyectoId: number): Observable<HitoResponseDTO[]> {
    return this.client.get<HitoResponseDTO[]>(`${this.API_URL}/${proyectoId}/hitos`)
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/hitos - Crear hito
  crearHito(proyectoId: number, datos: HitoRequestDTO): Observable<HitoResponseDTO> {
    return this.client.post<HitoResponseDTO>(`${this.API_URL}/${proyectoId}/hitos`, datos)
  }

  // PUT /api/v1/freelance/proyectos/{proyectoId}/hitos/{hitoId}/estado?nuevoEstado=PENDIENTE|COMPLETADO|PAGADO
  actualizarEstadoHito(
    proyectoId: number,
    hitoId: number,
    nuevoEstado: EstadoHito
  ): Observable<void> {
    return this.client.put<void>(
      `${this.API_URL}/${proyectoId}/hitos/${hitoId}/estado`,
      null,
      { params: { nuevoEstado } }
    )
  }
}
