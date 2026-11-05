import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, tap, delay } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { EmpresaRequestDTO, EmpresaResponseDTO } from '../models/empresa.models'

@Service()
export class EmpresaService {
  readonly API_URL = `${environment.apiUrl}/empresas`
  protected client = inject(HttpClient)

  readonly empresaActual = signal<EmpresaResponseDTO | null>(null)
  readonly isLoading = signal<boolean>(false)

  // Cargar perfil corporativo de la empresa autenticada
  getMiEmpresa(): Observable<EmpresaResponseDTO> {
    this.isLoading.set(true)

    if (environment.bypassAuth) {
      const mockEmpresa: EmpresaResponseDTO = this.empresaActual() || {
        id: 101,
        uuid: 'emp-uuid-9841',
        nombre: 'InnovaCorp Technologies S.A.',
        descripcion: 'Compañía líder en transformación digital y desarrollo de software escalable en la nube. Diseñamos ecosistemas de microservicios, plataformas SaaS y arquitecturas seguras para el sector corporativo y financiero.',
        sitio_web: 'https://innovacorp.example.com',
        ubicacion: 'Buenos Aires, Argentina',
        direccion: 'Av. del Libertador 1450, Piso 12',
        telefono: '+54 11 4821 9900',
        rubro: 'Tecnología y Software',
        logo: '',
        banner: '',
        perfil_id: 1
      }
      return of(mockEmpresa).pipe(
        delay(200),
        tap((data) => {
          this.empresaActual.set(data)
          this.isLoading.set(false)
        })
      )
    }

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

  // Crear o actualizar datos comerciales de la empresa (POST / PUT)
  guardarEmpresa(datos: EmpresaRequestDTO): Observable<EmpresaResponseDTO> {
    const actual = this.empresaActual()

    if (environment.bypassAuth) {
      const actualizado: EmpresaResponseDTO = {
        id: actual?.id || 101,
        uuid: actual?.uuid || 'emp-uuid-9841',
        perfil_id: actual?.perfil_id || 1,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        sitio_web: datos.sitio_web,
        ubicacion: datos.ubicacion,
        direccion: datos.direccion,
        telefono: datos.telefono,
        rubro: datos.rubro,
        logo: datos.logo || actual?.logo || '',
        banner: datos.banner || actual?.banner || ''
      }
      return of(actualizado).pipe(
        delay(300),
        tap((data) => this.empresaActual.set(data))
      )
    }

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
    if (environment.bypassAuth) {
      const localUrl = URL.createObjectURL(file)
      this.empresaActual.update((emp) => (emp ? { ...emp, logo: localUrl } : null))
      return of({ logoUrl: localUrl }).pipe(delay(250))
    }

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
    if (environment.bypassAuth) {
      const localUrl = URL.createObjectURL(file)
      this.empresaActual.update((emp) => (emp ? { ...emp, banner: localUrl } : null))
      return of({ bannerUrl: localUrl }).pipe(delay(250))
    }

    const formData = new FormData()
    formData.append('file', file)
    return this.client.post<{ bannerUrl: string }>(`${this.API_URL}/banner`, formData).pipe(
      tap((res) => {
        this.empresaActual.update((emp) => (emp ? { ...emp, banner: res.bannerUrl } : null))
      })
    )
  }
}
