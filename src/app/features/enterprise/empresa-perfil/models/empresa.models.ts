// Empresa DTO contracts
// POST /api/v1/empresas y PUT /api/v1/empresas/{id}
export interface EmpresaRequestDTO {
  nombre: string
  descripcion: string
  sitio_web?: string
  ubicacion?: string
  perfil_id?: number
}

// GET /api/v1/empresas/{id}
export interface EmpresaResponseDTO {
  id: number
  uuid: string
  nombre: string
  direccion?: string
  sitio_web?: string
  ubicacion?: string
  perfil_id: number
}

// GET /api/v1/empresas/dashboard
export interface DashboardStatsResponseDTO {
  totalVacantes: number
  totalPostulaciones: number
  entrevistasPendientes: number
  contratacionesEfectuadas: number
}
