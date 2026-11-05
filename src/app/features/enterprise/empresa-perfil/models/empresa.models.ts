// Empresa DTO contracts
// POST /api/v1/empresas y PUT /api/v1/empresas/{id}
export interface EmpresaRequestDTO {
  nombre: string
  descripcion: string
  sitio_web?: string
  ubicacion?: string
  direccion?: string
  telefono?: string
  rubro?: string
  logo?: string
  banner?: string
  perfil_id?: number
}

// Modelo de formulario reactivo para Signal Forms
export interface EmpresaFormModel {
  nombre: string
  descripcion: string
  sitio_web: string
  ubicacion: string
  direccion: string
  telefono: string
  rubro: string
  logo: string
  banner: string
}

// GET /api/v1/empresas/{id}
export interface EmpresaResponseDTO {
  id: number
  uuid: string
  nombre: string
  descripcion?: string
  direccion?: string
  sitio_web?: string
  ubicacion?: string
  telefono?: string
  rubro?: string
  logo?: string
  banner?: string
  perfil_id: number
}

// GET /api/v1/empresas/dashboard
export interface DashboardStatsResponseDTO {
  totalVacantes: number
  totalPostulaciones: number
  entrevistasPendientes: number
  contratacionesEfectuadas: number
}
