import { TokenStorage } from './../../../core/auth/services/token-storage'
import { inject, Service, signal, computed } from '@angular/core'
import { environment } from '../../../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { PerfilUsuarioDTO, PerfilCompletitud, ItemFaltantePerfil, EditProfileModel } from '../models/perfil.models'
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

    if (p.tieneCv) puntos += 20
    else itemsFaltantes.push({ clave: 'cv', label: 'Adjuntar CV (PDF)' })

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
}
