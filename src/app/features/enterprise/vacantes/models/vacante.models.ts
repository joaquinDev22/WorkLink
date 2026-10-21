// Vacante & Postulacion DTO contracts
export type ModalidadTrabajo = 'REMOTO' | 'HIBRIDO' | 'PRESENCIAL'

export type EstadoPostulacion =
  | 'PENDIENTE'
  | 'VISUALIZADO'
  | 'ENTREVISTA_AGENDADA'
  | 'RECHAZADO'

// POST /api/v1/vacantes, POST /api/v1/vacantes/me y PUT /api/v1/vacantes/{id}
export interface VacanteRequestDTO {
  puesto: string
  descripcion: string
  finalizacion: string // YYYY-MM-DD (@Future)
  empresaId?: number
  logo?: string
  ubicacion?: string
  tipoUbicacion?: ModalidadTrabajo | string
  tipoVacante?: string
  salario?: string
  etiquetas?: string[]
}

// GET /api/v1/vacantes, GET /api/v1/vacantes/me y GET /api/v1/vacantes/{id}
export interface VacanteResponseDTO {
  vacanteId: number
  uuid: string
  puesto: string
  descripcion: string
  publicacion: string  // YYYY-MM-DD
  finalizacion: string // YYYY-MM-DD
  empresaId: number
  nombreEmpresa: string
  logo?: string
  ubicacion?: string
  tipoUbicacion?: string
  tipoVacante?: string
  salario?: string
  etiquetas: string[]
}

// GET y POST /api/v1/vacantes/{vacanteId}/postulaciones
export interface PostulacionResponseDTO {
  postulacionId: number
  vacanteId: number
  puestoVacante: string
  employeeId: number
  nombreCandidato: string
  emailCandidato: string
  fechaPostulacion: string // YYYY-MM-DD
  estado: EstadoPostulacion
  mensaje: string
  tieneCvSubido: boolean
}
