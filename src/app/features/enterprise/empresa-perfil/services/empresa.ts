import { computed, inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, tap, delay } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { EmpresaRequestDTO, EmpresaResponseDTO, DashboardStatsResponseDTO } from '../models/empresa.models'
import { PerfilCompletitud, calcularCompletitudPorRol } from '../../../perfiles/models/perfil.models'

@Service()
export class EmpresaService {
  readonly API_URL = `${environment.apiUrl}/empresas`
  protected client = inject(HttpClient)

  readonly empresaActual = signal<EmpresaResponseDTO | null>(null)
  readonly isLoading = signal<boolean>(false)

  readonly completitud = computed<PerfilCompletitud>(() => {
    const emp = this.empresaActual()
    if (!emp) {
      return { porcentaje: 0, completado: false, itemsFaltantes: [] }
    }
    return calcularCompletitudPorRol('EMPRESA', {
      logo: emp.logo,
      bannerPerfil: emp.banner,
      descripcion: emp.descripcion,
      ubicacion: emp.ubicacion,
      sitioWeb: emp.sitio_web,
      telefono: emp.telefono
    })
  })

  // Cargar perfil corporativo de la empresa autenticada
  getMiEmpresa(): Observable<EmpresaResponseDTO> {
    this.isLoading.set(true)

    return this.client.get<EmpresaResponseDTO>(`${this.API_URL}/my`).pipe(
      tap({
        next: (data) => {
          this.empresaActual.set(data)
          this.isLoading.set(false)
        },
        error: () => this.isLoading.set(false)
      })
    )
  }

  // Obtener perfil público de una empresa (GET /api/v1/empresas/{id} o /uuid/{uuid})
  getEmpresaById(idOrUuid: number | string): Observable<EmpresaResponseDTO> {
    const path = typeof idOrUuid === 'string' && idOrUuid.startsWith('uuid/') ? idOrUuid : idOrUuid
    return this.client.get<EmpresaResponseDTO>(`${this.API_URL}/${path}`)
  }

  // Crear o actualizar datos comerciales de la empresa (POST / PUT)
  guardarEmpresa(datos: EmpresaRequestDTO): Observable<EmpresaResponseDTO> {
    const actual = this.empresaActual()

    if (actual?.id) {
      return this.client.put<EmpresaResponseDTO>(`${this.API_URL}/${actual.id}`, datos).pipe(
        tap((data) => this.empresaActual.set(data))
      )
    }

    return this.client.post<EmpresaResponseDTO>(this.API_URL, datos).pipe(
      tap((data) => this.empresaActual.set(data))
    )
  }

  // Carga de logotipo corporativo
  uploadLogo(file: File): Observable<{ logoUrl: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return this.client.post<{ logoUrl: string }>(`${this.API_URL}/logo`, formData).pipe(
      tap((res) => {
        this.empresaActual.update((emp) => (emp ? { ...emp, logo: res.logoUrl } : null))
      })
    )
  }

  // Carga de banner o portada corporativa
  uploadBanner(file: File): Observable<{ bannerUrl: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return this.client.post<{ bannerUrl: string }>(`${this.API_URL}/banner`, formData).pipe(
      tap((res) => {
        this.empresaActual.update((emp) => (emp ? { ...emp, banner: res.bannerUrl } : null))
      })
    )
  }

  // Métricas agregadas para el dashboard corporativo (GET /api/v1/empresas/dashboard)
  getDashboardStats(): Observable<DashboardStatsResponseDTO> {
    return this.client.get<DashboardStatsResponseDTO>(`${this.API_URL}/dashboard`)
  }
}
