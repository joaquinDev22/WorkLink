// Recruiter DTO contracts
// POST y PUT /api/v1/empresas/recruiters
export interface RecruiterRequestDTO {
  nombre: string
  apellido: string
  email: string
  fechaNacimiento: string // YYYY-MM-DD
  area?: string
}

// GET /api/v1/empresas/recruiters
export interface RecruiterResponseDTO {
  recruiterId: number
  nombre: string
  apellido: string
  email: string
  fechaNacimiento: string // YYYY-MM-DD
  area?: string
  empresaId: number
  nombreEmpresa: string
}

// Modelo tipado estricto para Signal Forms (sin opcionales para evitar fallos de enlace en templates)
export interface RecruiterFormModel {
  nombre: string
  apellido: string
  email: string
  fechaNacimiento: string
  area: string
}
