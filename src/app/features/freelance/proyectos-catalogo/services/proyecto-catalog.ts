import { inject, Service } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { ProyectoResponseDTO } from '../../proyecto-gestion/models/proyecto.models'

@Service()
export class ProyectoCatalog {
  private readonly apiUrl = `${environment.apiUrl}/freelance/proyectos`
  private http = inject(HttpClient)

  // Obtiene el listado de proyectos con filtros opcionales
  getProyectos(area?: string): Observable<ProyectoResponseDTO[]> {
    if (environment.bypassAuth) {
      return of(this.getMockProyectos(area))
    }

    let params = new HttpParams()
    if (area && area !== 'TODOS') {
      params = params.set('area', area)
    }

    return this.http.get<ProyectoResponseDTO[]>(this.apiUrl, { params })
  }

  // Obtiene el detalle de un proyecto por su ID numérico o UUID
  getProyectoById(id: string | number): Observable<ProyectoResponseDTO | undefined> {
    if (environment.bypassAuth) {
      const idStr = String(id).toLowerCase()
      const mock = this.getMockProyectos().find(
        p => p.uuid.toLowerCase() === idStr || String(p.proyectoId) === idStr
      )
      return of(mock)
    }

    return this.http.get<ProyectoResponseDTO>(`${this.apiUrl}/${id}`)
  }

  // Envía una propuesta/postulación técnica a un proyecto
  postularAProyecto(proyectoId: number, data: { costo: number, descripcion: string, tiempoEntrega?: string }): Observable<{ mensaje: string, postulacionId?: number }> {
    if (environment.bypassAuth) {
      return of({ mensaje: '¡Tu propuesta ha sido enviada con éxito!', postulacionId: 101 })
    }

    return this.http.post<{ mensaje: string, postulacionId?: number }>(
      `${this.apiUrl}/${proyectoId}/postulaciones`,
      data
    )
  }

  // Datos simulados para diseñar y probar la interfaz de inmediato
  private getMockProyectos(areaFiltro?: string): ProyectoResponseDTO[] {
    const mocks: ProyectoResponseDTO[] = [
      {
        proyectoId: 1,
        uuid: 'proj-001',
        nombreProyecto: 'Migracion de Sistemas',
        area: 'Fullstack',
        descripcion: 'Refactorización y migración de Microservicios con Spring Boot 3 y Angular v22. Buscamos un perfil con experiencia sólida en arquitecturas desacopladas, despliegue con Docker y bases de datos relacionales.',
        fechaPublicacion: '2026-10-25',
        presupuestoMin: 1200,
        presupuestoMax: 2000,
        clienteId: 10,
        nombreCliente: 'Fintech Solutions S.A.',
        duracion: '2 meses',
        tipoPago: 'Por Hitos',
        habilidades: ['Angular', 'Spring Boot', 'Docker', 'PostgreSQL'],
        estado: 'BUSCANDO_TALENTO'
      },
      {
        proyectoId: 2,
        uuid: 'proj-002',
        nombreProyecto: 'Dashboard SaaS',
        area: 'Frontend',
        descripcion: 'Desarrollo de Dashboard SaaS con Tailwind CSS v4, Signals y gráficos en tiempo real. Se requiere diseño responsivo impecable, modo oscuro y microinteracciones fluidas.',
        fechaPublicacion: '2026-10-28',
        presupuestoMin: 800,
        presupuestoMax: 1400,
        clienteId: 11,
        nombreCliente: 'CloudMetrics Inc.',
        duracion: '3 semanas',
        tipoPago: 'Monto Fijo',
        habilidades: ['Angular', 'Tailwind CSS', 'TypeScript', 'Signals'],
        estado: 'BUSCANDO_TALENTO'
      },
      {
        proyectoId: 3,
        uuid: 'proj-003',
        nombreProyecto: 'Integracion con Mercado Pago',
        area: 'Mobile / Backend',
        descripcion: 'Integración de pasarela de pagos MercadoPago y sistema de notificaciones push para ecommerce móvil. Necesario manejo de Webhooks, callbacks y seguridad con firmas criptográficas.',
        fechaPublicacion: '2026-10-29',
        presupuestoMin: 950,
        presupuestoMax: 1600,
        clienteId: 12,
        nombreCliente: 'Logística Express',
        duracion: '1 mes',
        tipoPago: 'Por Hitos',
        habilidades: ['Java', 'MercadoPago SDK', 'REST APIs', 'Spring Security'],
        estado: 'BUSCANDO_TALENTO'
      }
    ]

    if (areaFiltro && areaFiltro !== 'TODOS') {
      return mocks.filter(m => m.area.toLowerCase().includes(areaFiltro.toLowerCase()))
    }

    return mocks
  }
}
