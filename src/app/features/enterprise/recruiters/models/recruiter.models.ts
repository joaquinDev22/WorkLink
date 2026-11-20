// Recruiter DTO contracts
// POST y PUT /api/v1/empresas/recruiters: la empresa vincula al recruiter solo por email
export interface RecruiterRequestDTO {
  email: string
}

// GET /api/v1/empresas/recruiters y GET /api/v1/recruiter/vinculacion
export interface RecruiterResponseDTO {
  recruiterId: number
  nombre: string
  apellido: string
  email: string
  fechaNacimiento?: string | null // YYYY-MM-DD
  area?: string | null
  empresaId: number
  nombreEmpresa: string
  fechaVinculacion?: string | null // ISO
  vinculacionVista: boolean
  bajaSolicitadaEn?: string | null // ISO: cuándo pidió la baja
  fechaBajaHabilitada?: string | null // ISO: desde cuándo puede desvincularse solo
}

// Modelo tipado estricto para Signal Forms
export interface RecruiterFormModel {
  email: string
}
