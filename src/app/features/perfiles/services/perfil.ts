import { TokenStorage } from './../../../core/auth/services/token-storage'
import { inject, Service, signal, computed } from '@angular/core'
import { environment } from '../../../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { PerfilUsuarioDTO, PerfilCompletitud, ItemFaltantePerfil } from '../models/perfil.models'
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
    } else {
      // FREELANCER, POSTULANTE, RECRUITER, CLIENTE
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
        nombre: nombreUsuario,
        apellido: rol === 'EMPRESA' ? undefined : 'Pérez',
        email: `${nombreUsuario.toLowerCase().replace(/\s+/g, '')}@worklink.app`,
        rol: rol,
        descripcion: rol === 'EMPRESA'
          ? 'Empresa tecnológica líder en innovación y desarrollo de software de alto impacto.'
          : 'Desarrollador Full Stack apasionado por Angular, TypeScript y arquitecturas reactivas con Signals.',
        ubicacion: 'Buenos Aires, Argentina',
        pais: 'Argentina',
        telefono: '+54 11 5555-0199',
        sitioWeb: rol === 'EMPRESA' ? 'https://worklink.app' : undefined,
        fotoPerfil: undefined,
        bannerPerfil: undefined,
        habilidades: rol === 'EMPRESA' ? [] : [
          { habilidadId: 1, nombre: 'Angular v22', nivel: 4 },
          { habilidadId: 2, nombre: 'TypeScript', nivel: 3 },
          { habilidadId: 3, nombre: 'Tailwind CSS', nivel: 4 },
          { habilidadId: 4, nombre: 'Spring Boot 3', nivel: 3 },
          { habilidadId: 5, nombre: 'PostgreSQL', nivel: 2 }
        ],
        proyectos: rol === 'EMPRESA' ? [] : [
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

  updateProfile(datos: Partial<PerfilUsuarioDTO>): Observable<PerfilUsuarioDTO> {
    const current = this.perfilActual()
    const actualizado = { ...current, ...datos } as PerfilUsuarioDTO
    this.perfilActual.set(actualizado)

    if (environment.bypassAuth) {
      return of(actualizado).pipe(delay(300))
    }
    return this.client.put<PerfilUsuarioDTO>(`${this.API_URL}/updateProfile`, datos)
  }
}
