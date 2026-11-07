import { TokenStorage } from './../../../core/auth/services/token-storage'
import { inject, Service, signal, computed } from '@angular/core'
import { environment } from '../../../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { PerfilUsuarioDTO, PerfilCompletitud, ItemFaltantePerfil, EditProfileModel, PerfilHabilidadDTO, NivelHabilidad, HabilidadCatalogoDTO, PerfilProyectoPortafolioDTO, ReputacionPerfilDTO } from '../models/perfil.models'
import { Observable, of, tap, delay, finalize } from 'rxjs'

@Service()
export class Perfil {
  readonly API_URL = `${environment.apiUrl}/perfiles`

  protected client = inject(HttpClient)
  private tokenStorage = inject(TokenStorage)

  readonly perfilActual = signal<PerfilUsuarioDTO | null>(null)
  readonly isLoading = signal<boolean>(false)

  // Medidor reactivo de completitud del perfil con checklist de faltantes
  readonly completitud = computed<PerfilCompletitud>(() => {
    const p = this.perfilActual()
    if (!p) {
      return { porcentaje: 0, completado: false, itemsFaltantes: [] }
    }

    const itemsFaltantes: ItemFaltantePerfil[] = []
    let puntos = 0

    if (p.rol === 'EMPRESA') {
      if (p.fotoPerfil || p.logo) puntos += 25
      else itemsFaltantes.push({ clave: 'foto', label: 'Logotipo de la empresa' })

      if (p.descripcion && p.descripcion.trim().length > 10) puntos += 25
      else itemsFaltantes.push({ clave: 'descripcion', label: 'Descripción corporativa' })

      if (p.sitioWeb && p.sitioWeb.trim().length > 4) puntos += 25
      else itemsFaltantes.push({ clave: 'sitioWeb', label: 'Sitio web oficial' })

      if (p.ubicacion || p.pais) puntos += 25
      else itemsFaltantes.push({ clave: 'ubicacion', label: 'País o sede principal' })
    } else if (p.rol === 'RECRUITER') {
      if (p.fotoPerfil) puntos += 25
      else itemsFaltantes.push({ clave: 'foto', label: 'Foto de perfil' })

      if (p.bannerPerfil) puntos += 25
      else itemsFaltantes.push({ clave: 'banner', label: 'Banner de portada' })

      if (p.descripcion && p.descripcion.trim().length > 15) puntos += 25
      else itemsFaltantes.push({ clave: 'descripcion', label: 'Resumen de trayectoria' })

      if (p.telefono) puntos += 25
      else itemsFaltantes.push({ clave: 'telefono', label: 'Teléfono corporativo' })
    } else {
      // FREELANCER, POSTULANTE
      if (p.tieneCv) puntos += 20
      else itemsFaltantes.push({ clave: 'cv', label: 'Adjuntar CV (PDF)' })

      if (p.fotoPerfil) puntos += 20
      else itemsFaltantes.push({ clave: 'foto', label: 'Foto de perfil' })

      if (p.bannerPerfil) puntos += 15
      else itemsFaltantes.push({ clave: 'banner', label: 'Banner de portada' })

      if (p.descripcion && p.descripcion.trim().length > 15) puntos += 20
      else itemsFaltantes.push({ clave: 'descripcion', label: 'Biografía profesional' })

      if (p.habilidades && p.habilidades.length >= 3) puntos += 25
      else if (p.habilidades && p.habilidades.length > 0) {
        puntos += 15
        itemsFaltantes.push({ clave: 'habilidades', label: 'Agrega al menos 3 habilidades' })
      } else {
        itemsFaltantes.push({ clave: 'habilidades', label: 'Habilidades técnicas' })
      }

      if (p.proyectos && p.proyectos.length > 0) puntos += 20
      else itemsFaltantes.push({ clave: 'proyectos', label: 'Proyectos de portafolio' })
    }

    const porcentaje = Math.min(100, Math.max(0, puntos))
    return {
      porcentaje,
      completado: porcentaje === 100,
      itemsFaltantes
    }
  })

  cargarPerfil(): Observable<PerfilUsuarioDTO> {
    this.isLoading.set(true)
    return this.getProfile().pipe(
      tap((data) => this.perfilActual.set(data)),
      finalize(() => this.isLoading.set(false))
    )
  }

  getProfile(): Observable<PerfilUsuarioDTO> {
    // Soporte para Development Mode con bypassAuth
    if (environment.bypassAuth) {
      const session = this.tokenStorage.getSession()
      const rol = session?.rol || 'FREELANCER'
      const nombreUsuario = session?.nombreUsuario || 'Usuario Desarrollador'

      const mockPerfil: PerfilUsuarioDTO = {
        nombre: rol === 'EMPRESA' 
          ? 'InnovaCorp Technologies S.A.' 
          : (rol === 'RECRUITER' ? 'Lucía' : nombreUsuario),
        apellido: rol === 'EMPRESA' 
          ? undefined 
          : (rol === 'RECRUITER' ? 'Fernández' : 'Pérez'),
        email: rol === 'EMPRESA'
          ? 'contacto@innovacorp.com'
          : (rol === 'RECRUITER' ? 'lucia.fernandez@innovacorp.com' : `${nombreUsuario.toLowerCase().replace(/\s+/g, '')}@worklink.app`),
        rol: rol,
        descripcion: rol === 'EMPRESA'
          ? 'Compañía líder en transformación digital y desarrollo de software corporativo en la nube.'
          : (rol === 'RECRUITER'
              ? 'Líder de Adquisición de Talento en InnovaCorp Technologies S.A. Conectando talento IT estratégico.'
              : 'Desarrollador Full Stack apasionado por Angular, TypeScript y arquitecturas reactivas con Signals.'),
        ubicacion: 'Buenos Aires, Argentina',
        pais: 'Argentina',
        telefono: rol === 'EMPRESA' ? '+54 11 4821 9900' : '+54 11 5555-0199',
        sitioWeb: rol === 'EMPRESA' ? 'https://innovacorp.example.com' : undefined,
        fotoPerfil: undefined,
        bannerPerfil: undefined,
        habilidades: (rol === 'EMPRESA' || rol === 'RECRUITER') ? [] : [
          { habilidadId: 1, nombre: 'Angular v22', nivel: 4 },
          { habilidadId: 2, nombre: 'TypeScript', nivel: 3 },
          { habilidadId: 3, nombre: 'Tailwind CSS', nivel: 4 },
          { habilidadId: 4, nombre: 'Spring Boot 3', nivel: 3 },
          { habilidadId: 5, nombre: 'PostgreSQL', nivel: 2 }
        ],
        proyectos: (rol === 'EMPRESA' || rol === 'RECRUITER') ? [] : [
          {
            id: 1,
            nombre: 'WorkLink Platform UI',
            descripcion: 'Arquitectura frontend con Angular Signals, View Transitions API y Tailwind CSS.',
            link: 'https://github.com/worklink'
          },
          {
            id: 2,
            nombre: 'E-Commerce Gateway',
            descripcion: 'Pasarela de pagos con hitos protegidos y auditoría en tiempo real.',
            link: 'https://github.com/worklink/gateway'
          }
        ]
      }

      return of(mockPerfil).pipe(delay(400))
    }

    return this.client.get<PerfilUsuarioDTO>(`${this.API_URL}/getProfile`)
  }

  uploadPhoto(file: File): Observable<{ fotoUrl: string }> {
    return new Observable(observer => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        const current = this.perfilActual()
        if (current) {
          this.perfilActual.set({
            ...current,
            fotoPerfil: base64
          })
        }
        if (environment.bypassAuth) {
          observer.next({ fotoUrl: base64 })
          observer.complete()
        } else {
          const formData = new FormData()
          formData.append('file', file)
          this.client.post<{ fotoUrl: string }>(`${this.API_URL}/uploadMyPhoto`, formData).subscribe({
            next: (res) => {
              observer.next(res)
              observer.complete()
            },
            error: (err) => observer.error(err)
          })
        }
      }
      reader.onerror = (err) => observer.error(err)
      reader.readAsDataURL(file)
    })
  }

  uploadBanner(file: File): Observable<{ bannerUrl: string }> {
    return new Observable(observer => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        const current = this.perfilActual()
        if (current) {
          this.perfilActual.set({
            ...current,
            bannerPerfil: base64
          })
        }
        if (environment.bypassAuth) {
          observer.next({ bannerUrl: base64 })
          observer.complete()
        } else {
          const formData = new FormData()
          formData.append('file', file)
          this.client.post<{ bannerUrl: string }>(`${this.API_URL}/uploadMyBanner`, formData).subscribe({
            next: (res) => {
              observer.next(res)
              observer.complete()
            },
            error: (err) => observer.error(err)
          })
        }
      }
      reader.onerror = (err) => observer.error(err)
      reader.readAsDataURL(file)
    })
  }

  updateProfile(datos: EditProfileModel): Observable<PerfilUsuarioDTO> {
    const current = this.perfilActual()
    const actualizado = { ...current, ...datos } as PerfilUsuarioDTO
    this.perfilActual.set(actualizado)

    if (environment.bypassAuth) {
      return of(actualizado).pipe(delay(300))
    }
    return this.client.put<PerfilUsuarioDTO>(`${this.API_URL}/updateProfile`, datos)
  }

  // 1. Descargar o previsualizar el CV en streaming binario
  // En la clase Perfil (perfil.ts)
  private mockCvFile: File | Blob | null = null

  // 1. Descargar o previsualizar el CV
  descargarMiCV(): Observable<Blob> {
    if (environment.bypassAuth) {
      // Si ya subiste tu PDF en esta sesión, devuelve exactamente tu archivo real
      if (this.mockCvFile) {
        return of(this.mockCvFile).pipe(delay(200))
      }

      // Fallback: un PDF mínimo 100% válido y legible por cualquier navegador
      const pdfValidoBase64 = 'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGROCihDVyBNb2NrIC0gV29ya0xpbmsgUGxhdGZvcm0pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbigKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjE2IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzEwCiUlRU9G'
      const bytes = Uint8Array.from(atob(pdfValidoBase64), c => c.charCodeAt(0))
      return of(new Blob([bytes], { type: 'application/pdf' })).pipe(delay(200))
    }

    return this.client.get(`${this.API_URL}/downloadMyCV`, {
      responseType: 'blob'
    })
  }

  // 2. Subir o reemplazar el CV
  uploadCV(file: File): Observable<{ message: string }> {
    if (file.type !== 'application/pdf') {
      throw new Error('Solo se permiten documentos en formato PDF')
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('El archivo no debe superar los 5 MB')
    }

    const formData = new FormData()
    formData.append('file', file)

    if (environment.bypassAuth) {
      // 💡 Guardamos tu archivo real en memoria local
      this.mockCvFile = file
      return of({ message: 'CV subido exitosamente a la base de datos.' }).pipe(
        delay(400),
        tap(() => {
          this.perfilActual.update((p) => (p ? { ...p, tieneCv: true } : null))
        })
      )
    }

    return this.client.post<{ message: string }>(`${this.API_URL}/uploadMyCV`, formData).pipe(
      tap(() => {
        this.perfilActual.update((p) => (p ? { ...p, tieneCv: true } : null))
      })
    )
  }
  // 1. Obtener catálogo sugerido de habilidades
  getHabilidadesCatalogo(): Observable<HabilidadCatalogoDTO[]> {
    if (environment.bypassAuth) {
      return of([
        { id: 1, name: 'Angular' },
        { id: 2, name: 'TypeScript' },
        { id: 3, name: 'Spring Boot' },
        { id: 4, name: 'Java' },
        { id: 5, name: 'Docker' },
        { id: 6, name: 'PostgreSQL' },
        { id: 7, name: 'Tailwind CSS' },
        { id: 8, name: 'React' },
        { id: 9, name: 'Node.js' },
        { id: 10, name: 'AWS' }
      ]).pipe(delay(150))
    }
    return this.client.get<HabilidadCatalogoDTO[]>(`${environment.apiUrl}/habilidades`)
  }
  // 2. Agregar una habilidad al perfil del usuario autenticado
  addMySkill(nombre: string, nivel: NivelHabilidad): Observable<PerfilHabilidadDTO> {
    if (environment.bypassAuth) {
      const nueva: PerfilHabilidadDTO = {
        habilidadId: Date.now(),
        nombre,
        nivel
      }

      this.perfilActual.update(p => {
        if (!p) return null
        const actuales = p.habilidades || []
        // Evita duplicados por nombre
        if (actuales.some(h => h.nombre.toLowerCase() === nombre.toLowerCase())) {
          return p
        }
        return { ...p, habilidades: [...actuales, nueva] }
      })
      return of(nueva).pipe(delay(250))
    }
    
    return this.client.post<PerfilHabilidadDTO>(
      `${this.API_URL}/addMySkill`,
      null,
      { params: { nombre, nivel: nivel.toString() } }
    ).pipe(
      tap(nueva => {
        this.perfilActual.update(p => p ? { ...p, habilidades: [...(p.habilidades || []), nueva] } : null)
      })
    )
  }
  // 3. Eliminar una habilidad del perfil
  removeMySkill(habilidadId: number): Observable<void> {
    if (environment.bypassAuth) {
      this.perfilActual.update(p => {
        if (!p) return null
        return {
          ...p,
          habilidades: (p.habilidades || []).filter(h => h.habilidadId !== habilidadId)
        }
      })
      return of(undefined).pipe(delay(150))
    }
    return this.client.delete<void>(`${this.API_URL}/removeMySkill/${habilidadId}`).pipe(
      tap(() => {
        this.perfilActual.update(p => {
          if (!p) return null
          return {
            ...p,
            habilidades: (p.habilidades || []).filter(h => h.habilidadId !== habilidadId)
          }
        })
      })
    )
  }

  // 4. Agregar proyecto al portafolio (WL-18)
  addMyProject(formData: FormData): Observable<PerfilProyectoPortafolioDTO> {
    if (environment.bypassAuth) {
      const nombre = (formData.get('nombre') as string) || 'Proyecto sin título'
      const descripcion = (formData.get('descripcion') as string) || ''
      const link = (formData.get('link') as string) || ''
      const file = formData.get('imagen') as File | null
      const nuevo: PerfilProyectoPortafolioDTO = {
        id: Date.now(),
        nombre,
        descripcion,
        link: link || undefined,
        imagen: file ? URL.createObjectURL(file) : undefined
      }
      this.perfilActual.update(p => {
        if (!p) return null
        return { ...p, proyectos: [...(p.proyectos || []), nuevo] }
      })
      return of(nuevo).pipe(delay(250))
    }
    return this.client.post<PerfilProyectoPortafolioDTO>(`${this.API_URL}/addMyProject`, formData).pipe(
      tap(nuevo => {
        this.perfilActual.update(p => p ? { ...p, proyectos: [...(p.proyectos || []), nuevo] } : null)
      })
    )
  }

  // 5. Eliminar proyecto del portafolio (WL-18)
  removeMyProject(proyectoId: number): Observable<void> {
    if (environment.bypassAuth) {
      this.perfilActual.update(p => {
        if (!p) return null
        return {
          ...p,
          proyectos: (p.proyectos || []).filter(pr => pr.id !== proyectoId)
        }
      })
      return of(undefined).pipe(delay(150))
    }
    return this.client.delete<void>(`${this.API_URL}/removeMyProject/`).pipe(
      tap(() => {
        this.perfilActual.update(p => {
          if (!p) return null
          return {
            ...p,
            proyectos: (p.proyectos || []).filter(pr => pr.id !== proyectoId)
          }
        })
      })
    )
  }

  // 6. Obtener reputación y calificaciones (WL-19: US-12)
  getCalificaciones(perfilId?: number): Observable<ReputacionPerfilDTO> {
    if (environment.bypassAuth) {
      const mockReputacion: ReputacionPerfilDTO = {
        promedio: 4.9,
        totalCalificaciones: 14,
        desglose: {
          estrellas5: 12,
          estrellas4: 2,
          estrellas3: 0,
          estrellas2: 0,
          estrellas1: 0
        },
        calificaciones: [
          {
            id: 1,
            autorNombre: 'Martín Gómez',
            autorRol: 'Tech Lead @ InnovaCorp',
            puntuacion: 5,
            comentario: 'Excelente profesional. Entregó la aplicación antes del plazo convenido con una arquitectura modular impecable en Angular y cobertura de pruebas robusta.',
            fecha: 'hace 2 semanas',
            proyectoNombre: 'Migración a Angular Standalone & Signals'
          },
          {
            id: 2,
            autorNombre: 'Sofía Herrera',
            autorRol: 'Product Owner @ SoftSolutions',
            puntuacion: 5,
            comentario: 'Gran capacidad de comunicación y resolución de problemas técnicos complejos en backend y bases de datos. Superó nuestras expectativas.',
            fecha: 'hace 1 mes',
            proyectoNombre: 'API Rest & Spring Boot Microservicios'
          },
          {
            id: 3,
            autorNombre: 'Lucas Benítez',
            autorRol: 'CTO @ FinTech Latam',
            puntuacion: 5,
            comentario: 'Muy proactivo y enfocado en la experiencia del usuario y rendimiento. Gran sentido estético y código limpio.',
            fecha: 'hace 2 meses',
            proyectoNombre: 'Dashboard Financiero en Tiempo Real'
          },
          {
            id: 4,
            autorNombre: 'Valeria Morales',
            autorRol: 'Lead Frontend @ PixelCraft',
            puntuacion: 5,
            comentario: 'Gran dominio de Tailwind CSS y animaciones fluidas respetando accesibilidad y tiempos de respuesta impecables.',
            fecha: 'hace 2 meses',
            proyectoNombre: 'Rediseño de Design System & Tokens'
          },
          {
            id: 5,
            autorNombre: 'Alejandro Ruiz',
            autorRol: 'Engineering Manager @ CloudScale',
            puntuacion: 5,
            comentario: 'Excelente código limpio, sin sobreingeniería y siguiendo principios pragmáticos. Cero bugs en QA.',
            fecha: 'hace 3 meses',
            proyectoNombre: 'Módulo de Facturación y Suscripciones'
          },
          {
            id: 6,
            autorNombre: 'Mariana Díaz',
            autorRol: 'Founder @ EcoMarket',
            puntuacion: 5,
            comentario: 'Cumplió con cada requisito al pie de la letra y aportó ideas valiosas que elevaron el nivel de la aplicación.',
            fecha: 'hace 3 meses',
            proyectoNombre: 'Marketplace Multi-Vendedor'
          },
          {
            id: 7,
            autorNombre: 'Carlos Sánchez',
            autorRol: 'DevOps Lead @ DataPeak',
            puntuacion: 4,
            comentario: 'Muy buena integración de Docker y pipelines de CI/CD para despliegues automatizados.',
            fecha: 'hace 4 meses',
            proyectoNombre: 'Contenedorización y Deploy en Cloud'
          },
          {
            id: 8,
            autorNombre: 'Florencia Castro',
            autorRol: 'Scrum Master @ NexusTech',
            puntuacion: 5,
            comentario: 'Puntualidad, compromiso y una comunicación constante en cada sprint. Un placer trabajar en equipo.',
            fecha: 'hace 4 meses',
            proyectoNombre: 'Gestor de Tareas Colaborativo'
          },
          {
            id: 9,
            autorNombre: 'Nicolás Paredes',
            autorRol: 'Tech Lead @ B2B Solutions',
            puntuacion: 5,
            comentario: 'Resolvió incidencias críticas en tiempo récord con soluciones arquitectónicas elegantes y sostenibles.',
            fecha: 'hace 5 meses',
            proyectoNombre: 'Optimización de Consultas SQL y Cache'
          },
          {
            id: 10,
            autorNombre: 'Camila Romero',
            autorRol: 'UX Director @ StudioDesign',
            puntuacion: 5,
            comentario: 'Respetó al 100% los tokens de diseño y las micro-interacciones solicitadas. El producto se siente premium.',
            fecha: 'hace 6 meses',
            proyectoNombre: 'Portal de Clientes Autogestión'
          },
          {
            id: 11,
            autorNombre: 'Gonzalo Fernández',
            autorRol: 'Backend Architect @ LogistiX',
            puntuacion: 5,
            comentario: 'Fácil integración entre frontend y nuestras APIs REST protegidas por JWT e interceptores seguros.',
            fecha: 'hace 7 meses',
            proyectoNombre: 'Trazabilidad de Envíos en Tiempo Real'
          },
          {
            id: 12,
            autorNombre: 'Paula Domínguez',
            autorRol: 'Product Manager @ SaludPlus',
            puntuacion: 5,
            comentario: 'Gran calidad humana y profesional. Adaptabilidad ante cambios de alcance sin perder el foco en la entrega.',
            fecha: 'hace 8 meses',
            proyectoNombre: 'Plataforma de Turnos Médicos'
          },
          {
            id: 13,
            autorNombre: 'Rodrigo Vega',
            autorRol: 'Tech Consultant @ ApexGlobal',
            puntuacion: 4,
            comentario: 'Código bien documentado y estructurado según las mejores prácticas de TypeScript moderno.',
            fecha: 'hace 9 meses',
            proyectoNombre: 'Auditoría y Refactorización de Frontend'
          },
          {
            id: 14,
            autorNombre: 'Esteban Quiroga',
            autorRol: 'CTO @ SmartAgro',
            puntuacion: 5,
            comentario: 'Desarrollo rápido, performante y con excelente atención a la responsividad en dispositivos móviles.',
            fecha: 'hace 10 meses',
            proyectoNombre: 'Aplicación PWA para Monitoreo de Campo'
          }
        ]
      }
      return of(mockReputacion).pipe(delay(200))
    }
    const endpoint = perfilId ? `${environment.apiUrl}/api/v1/perfiles/${perfilId}/calificaciones` : `${this.API_URL}/calificaciones`
    return this.client.get<ReputacionPerfilDTO>(endpoint)
  }
}
