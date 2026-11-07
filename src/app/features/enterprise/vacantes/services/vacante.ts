import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, tap, delay, throwError } from 'rxjs'
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
    },
    {
      vacanteId: 204,
      uuid: 'vac-204-go',
      puesto: 'Senior Backend Engineer (Go & Kubernetes)',
      descripcion: 'Construcción y escalabilidad de APIs de baja latencia procesando millones de transacciones por segundo. Experiencia en Go, Kafka, Docker y orquestación con Kubernetes.',
      publicacion: '2026-11-02',
      finalizacion: '2026-12-28',
      empresaId: 102,
      nombreEmpresa: 'CloudScale Logistics',
      ubicacion: 'Córdoba, Argentina (Remoto)',
      tipoUbicacion: 'REMOTO',
      tipoVacante: 'Full-time',
      salario: '$3.200 - $4.200 USD / mes',
      etiquetas: ['Go', 'Kubernetes', 'Kafka', 'PostgreSQL', 'Microservices']
    },
    {
      vacanteId: 205,
      uuid: 'vac-205-fs',
      puesto: 'Fullstack Developer (Node.js & React)',
      descripcion: 'Desarrollo integral de herramientas internas y pasarelas de pago para Fintech. Foco en APIs REST seguras, testing automatizado e interfaces de usuario accesibles.',
      publicacion: '2026-11-04',
      finalizacion: '2026-12-18',
      empresaId: 103,
      nombreEmpresa: 'FinTech Nexus Inc.',
      ubicacion: 'Montevideo, Uruguay (Híbrido)',
      tipoUbicacion: 'HIBRIDO',
      tipoVacante: 'Full-time',
      salario: '$2.000 - $2.800 USD / mes',
      etiquetas: ['Node.js', 'React', 'TypeScript', 'GraphQL', 'Jest']
    },
    {
      vacanteId: 206,
      uuid: 'vac-206-de',
      puesto: 'Data Engineer (Python, Spark & Databricks)',
      descripcion: 'Diseño e implementación de pipelines ETL/ELT robustos y lagos de datos empresariales. Optimización de consultas distribuidas y modelos predictivos.',
      publicacion: '2026-11-06',
      finalizacion: '2027-01-10',
      empresaId: 104,
      nombreEmpresa: 'Quantum Analytics Latam',
      ubicacion: 'Rosario, Argentina (Remoto)',
      tipoUbicacion: 'REMOTO',
      tipoVacante: 'Full-time',
      salario: '$2.800 - $3.900 USD / mes',
      etiquetas: ['Python', 'Apache Spark', 'Databricks', 'SQL', 'Airflow']
    },
    {
      vacanteId: 207,
      uuid: 'vac-207-sec',
      puesto: 'DevSecOps Specialist (AWS & Terraform)',
      descripcion: 'Automatización de pipelines CI/CD seguros, políticas de infraestructura como código y monitorización continua con Prometheus y Grafana.',
      publicacion: '2026-11-03',
      finalizacion: '2026-12-22',
      empresaId: 105,
      nombreEmpresa: 'Mercado Global Tech',
      ubicacion: 'Santiago, Chile (Presencial)',
      tipoUbicacion: 'PRESENCIAL',
      tipoVacante: 'Full-time',
      salario: '$3.500 - $4.500 USD / mes',
      etiquetas: ['AWS', 'Terraform', 'CI/CD', 'Security', 'Docker']
    }
  ]

  private readonly initialMockPostulaciones: PostulacionResponseDTO[] = [
    {
      postulacionId: 501,
      vacanteId: 201,
      puestoVacante: 'Senior Frontend Engineer (Angular / TypeScript)',
      employeeId: 301,
      nombreCandidato: 'Mateo Silvetti',
      emailCandidato: 'mateo.silvetti@gmail.com',
      fechaPostulacion: '2026-11-04',
      estado: 'PENDIENTE',
      mensaje: 'Hola equipo, tengo más de 5 años creando aplicaciones web con Angular y TypeScript. Cuento con experiencia en Signals, NgRx y Tailwind CSS. Me gustaría sumar mi experiencia a su equipo.',
      tieneCvSubido: true
    },
    {
      postulacionId: 502,
      vacanteId: 201,
      puestoVacante: 'Senior Frontend Engineer (Angular / TypeScript)',
      employeeId: 302,
      nombreCandidato: 'Valeria Gómez',
      emailCandidato: 'valeria.gomez@tech.io',
      fechaPostulacion: '2026-11-05',
      estado: 'VISUALIZADO',
      mensaje: 'Especialista en Design Systems y arquitectura de componentes reutilizables. He liderado migraciones a Standalone Components y optimización de Core Web Vitals.',
      tieneCvSubido: true
    },
    {
      postulacionId: 503,
      vacanteId: 202,
      puestoVacante: 'Tech Lead Fullstack (Java Spring & Angular)',
      employeeId: 303,
      nombreCandidato: 'Ignacio Rossi',
      emailCandidato: 'ignacio.rossi@dev.com',
      fechaPostulacion: '2026-11-02',
      estado: 'ENTREVISTA_AGENDADA',
      mensaje: '10 años en el ecosistema Java/Spring Boot y bases relacionales de alta concurrencia. Con amplia experiencia coordinando squads bajo metodologías Scrum.',
      tieneCvSubido: true
    },
    {
      postulacionId: 504,
      vacanteId: 203,
      puestoVacante: 'Product Designer UI/UX Senior',
      employeeId: 304,
      nombreCandidato: 'Camila Benítez',
      emailCandidato: 'camila.benitez@design.ar',
      fechaPostulacion: '2026-11-01',
      estado: 'RECHAZADO',
      mensaje: 'Diseñadora UX/UI enfocada en interfaces B2B y workflows analíticos. Comparto mi portfolio para su consideración.',
      tieneCvSubido: false
    }
  ]

  constructor() {
    this.postulaciones.set(this.initialMockPostulaciones)
  }

  // Carga las vacantes publicadas por la empresa autenticada (GET /api/v1/vacantes/me)
  getMisVacantes(): Observable<VacanteResponseDTO[]> {
    this.isLoading.set(true)

    if (environment.bypassAuth) {
      const list = this.misVacantes().length > 0 ? this.misVacantes() : this.initialMockVacantes.filter(v => v.empresaId === 101)
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

  // Feed público / catálogo general de vacantes (GET /api/v1/vacantes)
  getCatalogoVacantes(): Observable<VacanteResponseDTO[]> {
    this.isLoading.set(true)

    if (environment.bypassAuth) {
      // Combina las vacantes preconfiguradas con las que haya creado la empresa en la sesión
      const empresaCustom = this.misVacantes().filter(v => !this.initialMockVacantes.some(im => im.vacanteId === v.vacanteId))
      const combined = [...empresaCustom, ...this.initialMockVacantes]
      return of(combined).pipe(
        delay(200),
        tap((data) => {
          this.catalogoVacantes.set(data)
          this.isLoading.set(false)
        })
      )
    }

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
    if (environment.bypassAuth) {
      const list = [
        ...this.misVacantes(),
        ...this.catalogoVacantes(),
        ...this.initialMockVacantes
      ]
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
          this.catalogoVacantes.update((prev) => [res, ...prev])
          this.isMutating.set(false)
        })
      )
    }

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

    if (environment.bypassAuth) {
      const actual = this.misVacantes().find((v) => v.vacanteId === id) || this.initialMockVacantes.find((v) => v.vacanteId === id)
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
          this.catalogoVacantes.update((prev) => prev.map((v) => v.vacanteId === id ? res : v))
          this.isMutating.set(false)
        })
      )
    }

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

    if (environment.bypassAuth) {
      return of(undefined).pipe(
        delay(200),
        tap(() => {
          this.misVacantes.update((prev) => prev.filter((v) => v.vacanteId !== id))
          this.catalogoVacantes.update((prev) => prev.filter((v) => v.vacanteId !== id))
          this.isMutating.set(false)
        })
      )
    }

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
  postularse(vacanteId: number, mensaje: string): Observable<PostulacionResponseDTO> {
    this.isMutating.set(true)

    // Validar si ya se encuentra postulado (Escenario 2 - Gherkin WL-25)
    if (this.yaPostulado(vacanteId)) {
      this.isMutating.set(false)
      return throwError(() => ({
        status: 400,
        error: { message: 'Ya registras una postulación previa a esta búsqueda laboral.' }
      }))
    }

    if (environment.bypassAuth) {
      const targetVacante = [
        ...this.catalogoVacantes(),
        ...this.misVacantes(),
        ...this.initialMockVacantes
      ].find(v => v.vacanteId === vacanteId)

      const nuevaPostulacion: PostulacionResponseDTO = {
        postulacionId: Date.now(),
        vacanteId: vacanteId,
        puestoVacante: targetVacante?.puesto || 'Posición Laboral',
        employeeId: 300,
        nombreCandidato: 'Joaquín Nieva (Tú)',
        emailCandidato: 'joaquin.postulante@worklink.dev',
        fechaPostulacion: new Date().toISOString().split('T')[0],
        estado: 'PENDIENTE',
        mensaje: mensaje.trim(),
        tieneCvSubido: true
      }

      return of(nuevaPostulacion).pipe(
        delay(300),
        tap((res) => {
          this.postulaciones.update((prev) => [res, ...prev])
          this.misPostulacionesIds.update((prev) => [...prev, vacanteId])
          this.isMutating.set(false)
        })
      )
    }

    return this.client.post<PostulacionResponseDTO>(`${this.API_URL}/${vacanteId}/postulaciones/me`, { mensaje }).pipe(
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

  // Obtener postulaciones (por vacante o todas para recruiter) (GET /api/v1/vacantes/{id}/postulaciones)
  getPostulacionesPorVacante(vacanteId?: number): Observable<PostulacionResponseDTO[]> {
    this.isLoading.set(true)

    if (environment.bypassAuth) {
      const list = vacanteId
        ? this.postulaciones().filter((p) => p.vacanteId === vacanteId)
        : this.postulaciones()
      return of(list).pipe(
        delay(200),
        tap(() => this.isLoading.set(false))
      )
    }

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

    if (environment.bypassAuth) {
      const actual = this.postulaciones().find((p) => p.postulacionId === postulacionId)
      if (!actual) {
        this.isMutating.set(false)
        return throwError(() => new Error('Postulación no encontrada'))
      }

      const actualizada: PostulacionResponseDTO = {
        ...actual,
        estado: nuevoEstado
      }

      return of(actualizada).pipe(
        delay(200),
        tap((res) => {
          this.postulaciones.update((prev) =>
            prev.map((p) => (p.postulacionId === postulacionId ? res : p))
          )
          this.isMutating.set(false)
        })
      )
    }

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
    if (environment.bypassAuth) {
      const pdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGROCihDVyBNb2NrIC0gV29ya0xpbmsgUGxhdGZvcm0pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbigKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjE2IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzEwCiUlRU9G'
      const byteCharacters = atob(pdfBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      return of(blob).pipe(delay(200))
    }

    return this.client.get(`${this.API_URL}/postulaciones/${employeeId}/cv`, { responseType: 'blob' })
  }
}
