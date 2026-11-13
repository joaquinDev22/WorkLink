import { TokenStorage } from './../../../core/auth/services/token-storage'
import { inject, Service, signal, computed, effect } from '@angular/core'
import { environment } from '../../../../environments/environment'
import { HttpClient } from '@angular/common/http'
import {
  PerfilUsuarioDTO,
  PerfilCompletitud,
  ItemFaltantePerfil,
  EditProfileModel,
  PerfilHabilidadDTO,
  NivelHabilidad,
  HabilidadCatalogoDTO,
  PerfilProyectoPortafolioDTO,
  ReputacionPerfilDTO,
  calcularFaltantesPorRol
} from '../models/perfil.models'
import { Observable, of, tap, delay, finalize, catchError, throwError, map, forkJoin } from 'rxjs'
import { Cliente } from '../../freelance/cliente-dashboard/services/cliente'

const REPUTACION_VACIA: ReputacionPerfilDTO = {
  promedio: 0,
  totalCalificaciones: 0,
  desglose: { estrellas5: 0, estrellas4: 0, estrellas3: 0, estrellas2: 0, estrellas1: 0 },
  calificaciones: []
}

@Service()
export class Perfil {
  readonly API_URL = `${environment.apiUrl}/perfiles`

  protected client = inject(HttpClient)
  private tokenStorage = inject(TokenStorage)
  private clienteService = inject(Cliente)

  readonly perfilActual = signal<PerfilUsuarioDTO | null>(null)
  readonly isLoading = signal<boolean>(false)

  private completadosRecientes = signal<ItemFaltantePerfil[]>([])
  private ultimoPerfil: PerfilUsuarioDTO | null = null
  private ultimoRol: string | null = null

  constructor() {
    effect(() => {
      const p = this.perfilActual()
      const rolActual = this.tokenStorage.session()?.rol || p?.rol || null
      if (!p) {
        this.ultimoPerfil = null
        this.ultimoRol = rolActual
        return
      }

      if (this.ultimoRol && rolActual && this.ultimoRol !== rolActual) {
        this.completadosRecientes.set([])
      } else if (this.ultimoPerfil && rolActual && this.ultimoRol === rolActual) {
        const { items: prevFaltantes } = this.calcularFaltantes(this.ultimoPerfil, this.ultimoRol)
        const { items: currFaltantes } = this.calcularFaltantes(p, rolActual)
        const currClaves = new Set(currFaltantes.map(i => i.clave))

        // Detectar actividades completadas: estaban incompletas y ahora están completas
        const recienCompletados = prevFaltantes
          .filter(i => !currClaves.has(i.clave))
          .map(i => ({ ...i, completado: true }))

        if (recienCompletados.length > 0) {
          this.completadosRecientes.update(prev => {
            const keysExistentes = new Set(prev.map(x => x.clave))
            const nuevos = recienCompletados.filter(x => !keysExistentes.has(x.clave))
            return [...prev, ...nuevos]
          })

          setTimeout(() => {
            const clavesARemover = new Set(recienCompletados.map(x => x.clave))
            this.completadosRecientes.update(prev => prev.filter(x => !clavesARemover.has(x.clave)))
          }, 1500)
        }
      }

      this.ultimoPerfil = p
      this.ultimoRol = rolActual
    })
  }

  marcarActividadCompletada(clave: string, label?: string): void {
    const item: ItemFaltantePerfil = {
      clave,
      label: label || clave,
      completado: true
    }
    this.completadosRecientes.update(prev => [...prev.filter(x => x.clave !== clave), item])
    setTimeout(() => {
      this.completadosRecientes.update(prev => prev.filter(x => x.clave !== clave))
    }, 1500)
  }

  private calcularFaltantes(p: PerfilUsuarioDTO, rolOverride?: string): { puntos: number, items: ItemFaltantePerfil[] } {
    const rol = rolOverride || this.tokenStorage.session()?.rol || p.rol
    return calcularFaltantesPorRol(rol, p)
  }

  // Medidor reactivo de completitud del perfil con checklist de faltantes según rol activo en sesión
  readonly completitud = computed<PerfilCompletitud>(() => {
    const p = this.perfilActual()
    if (!p) {
      return { porcentaje: 0, completado: false, itemsFaltantes: [] }
    }

    const rolActivo = this.tokenStorage.session()?.rol || p.rol
    const { puntos, items: incompletos } = this.calcularFaltantes(p, rolActivo)
    const incompletosClaves = new Set(incompletos.map(i => i.clave))
    const completados = this.completadosRecientes().filter(c => !incompletosClaves.has(c.clave))

    const porcentaje = Math.min(100, Math.max(0, puntos))
    return {
      porcentaje,
      completado: porcentaje === 100 && completados.length === 0,
      itemsFaltantes: [...incompletos, ...completados]
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
    const session = this.tokenStorage.getSession()
    const sessionRol = session?.rol

    // Para CLIENTE combinamos /perfiles/getProfile con /client/me para asegurar datos reales del cliente
    if (sessionRol === 'CLIENTE') {
      return forkJoin({
        perfil: this.client.get<PerfilUsuarioDTO>(`${this.API_URL}/getProfile`).pipe(catchError(() => of(null))),
        cliente: this.clienteService.getMiPerfilCliente().pipe(catchError(() => of(null)))
      }).pipe(
        map(({ perfil, cliente }) => {
          if (!perfil && !cliente) {
            throw new Error('No se pudieron obtener los datos del perfil de cliente')
          }
          return {
            ...(perfil ?? {
              nombre: '',
              email: '',
              rol: 'CLIENTE',
              habilidades: [],
              proyectos: []
            }),
            nombre: cliente?.firstName || perfil?.nombre || session?.nombreUsuario || '',
            apellido: cliente?.lastName || perfil?.apellido || '',
            email: cliente?.email || perfil?.email || '',
            telefono: cliente?.phoneNumber || perfil?.telefono || '',
            pais: cliente?.country || perfil?.pais || '',
            fechaNacimiento: cliente?.fechaNacimiento || perfil?.fechaNacimiento || '',
            rol: 'CLIENTE',
            habilidades: [],
            proyectos: []
          } as PerfilUsuarioDTO
        })
      )
    }

    return this.client.get<PerfilUsuarioDTO>(`${this.API_URL}/getProfile`).pipe(
      map(data => {
        if (sessionRol && (data.rol === 'EMPLOYEE' || data.rol === 'POSTULANTE' || data.rol === 'FREELANCER')) {
          return { ...data, rol: sessionRol }
        }
        return data
      })
    )
  }

  uploadPhoto(file: File): Observable<{ fotoUrl: string }> {
    return this.subirImagen<{ fotoUrl: string }>(file, 'fotoPerfil', 'uploadMyPhoto')
  }

  uploadBanner(file: File): Observable<{ bannerUrl: string }> {
    return this.subirImagen<{ bannerUrl: string }>(file, 'bannerPerfil', 'uploadMyBanner')
  }

  // Valida tipo y tamaño, muestra la imagen al instante y la revierte si el servidor rechaza la subida
  private subirImagen<T>(
    file: File,
    campo: 'fotoPerfil' | 'bannerPerfil',
    endpoint: string
  ): Observable<T> {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      return throwError(() => new Error('La imagen debe ser PNG, JPG o WebP.'))
    }
    if (file.size > 5 * 1024 * 1024) {
      return throwError(() => new Error('La imagen no puede superar los 5 MB.'))
    }

    return new Observable<T>(observer => {
      const anterior = this.perfilActual()?.[campo]
      const restaurar = () => {
        const actual = this.perfilActual()
        if (actual) this.perfilActual.set({ ...actual, [campo]: anterior })
      }
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        const current = this.perfilActual()
        if (current) this.perfilActual.set({ ...current, [campo]: base64 })

        const formData = new FormData()
        formData.append('file', file)
        const sub = this.client.post<T>(`${this.API_URL}/${endpoint}`, formData).subscribe({
          next: (res) => {
            observer.next(res)
            observer.complete()
          },
          error: (err) => {
            restaurar()
            observer.error(err)
          }
        })
        observer.add(sub)
      }
      reader.onerror = (err) => observer.error(err)
      reader.readAsDataURL(file)
    })
  }

  updateProfile(datos: EditProfileModel): Observable<PerfilUsuarioDTO> {
    const current = this.perfilActual()

    const payload: EditProfileModel = {
      nombre: (datos.nombre || current?.nombre || '').trim(),
      apellido: (datos.apellido || current?.apellido || '').trim(),
      email: (datos.email || current?.email || '').trim(),
      rol: current?.rol || 'POSTULANTE',
      telefono: (datos.telefono || current?.telefono || '').trim(),
      pais: (datos.pais || current?.pais || '').trim(),
      descripcion: (datos.descripcion || current?.descripcion || '').trim(),
      ubicacion: (datos.ubicacion || current?.ubicacion || '').trim(),
      sitioWeb: (datos.sitioWeb || current?.sitioWeb || '').trim(),
      fechaNacimiento: (datos.fechaNacimiento || current?.fechaNacimiento || '').trim(),
      tieneCv: Boolean(current?.tieneCv)
    }

    const actualizado = { ...current, ...payload } as PerfilUsuarioDTO
    this.perfilActual.set(actualizado)

    return this.client.put<PerfilUsuarioDTO>(`${this.API_URL}/updateProfile`, payload).pipe(
      catchError((err) => {
        this.perfilActual.set(current)
        return throwError(() => err)
      })
    )
  }

  // 1. Descargar o previsualizar el CV en streaming binario
  // En la clase Perfil (perfil.ts)

  // 1. Descargar o previsualizar el CV
  descargarMiCV(): Observable<Blob> {
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

    return this.client.post<{ message: string }>(`${this.API_URL}/uploadMyCV`, formData).pipe(
      tap(() => {
        this.perfilActual.update((p) => (p ? { ...p, tieneCv: true } : null))
      })
    )
  }
  // 1. Obtener catálogo sugerido de habilidades (GET /api/v1/habilidades)
  getHabilidadesCatalogo(): Observable<HabilidadCatalogoDTO[]> {
    return this.client.get<any[]>(`${environment.apiUrl}/habilidades`).pipe(
      map(items => (items || []).map(h => ({
        id: h.habilidadId ?? h.id,
        name: h.nombreHabilidad ?? h.name ?? '',
        habilidadId: h.habilidadId ?? h.id,
        nombreHabilidad: h.nombreHabilidad ?? h.name ?? ''
      })))
    )
  }
  // 2. Agregar una habilidad al perfil del usuario autenticado
  addMySkill(nombre: string, nivel: NivelHabilidad): Observable<PerfilHabilidadDTO> {
    const nivelNormalizado = Math.min(4, Math.max(1, nivel))

    return this.client.post<PerfilHabilidadDTO>(
      `${this.API_URL}/addMySkill`,
      null,
      { params: { nombre, nivel: nivelNormalizado.toString() } }
    ).pipe(
      tap(nueva => {
        this.perfilActual.update(p => p ? { ...p, habilidades: [...(p.habilidades || []), nueva] } : null)
      })
    )
  }
  // 3. Eliminar una habilidad del perfil
  removeMySkill(habilidadId: number): Observable<void> {
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
    return this.client.post<PerfilProyectoPortafolioDTO>(`${this.API_URL}/addMyProject`, formData).pipe(
      tap(nuevo => {
        this.perfilActual.update(p => p ? { ...p, proyectos: [...(p.proyectos || []), nuevo] } : null)
      })
    )
  }

  // 5. Eliminar proyecto del portafolio (WL-18)
  removeMyProject(proyectoId: number): Observable<void> {
    return this.client.delete<void>(`${this.API_URL}/removeMyProject/${proyectoId}`).pipe(
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
    const targetId = perfilId || 1
    const endpoint = `${this.API_URL}/${targetId}/calificaciones`
    return this.client.get<ReputacionPerfilDTO>(endpoint).pipe(
      // Sin calificaciones todavía: reputación vacía real, nunca reseñas inventadas
      map(data => data ?? REPUTACION_VACIA),
      catchError(() => of(REPUTACION_VACIA))
    )
  }

  // 7. Dar de baja lógica la cuenta del usuario autenticado (DELETE /api/v1/perfiles/me)
  darDeBajaMiCuenta(): Observable<void> {
    return this.client.delete<void>(`${this.API_URL}/me`).pipe(
      tap(() => this.perfilActual.set(null))
    )
  }
}
