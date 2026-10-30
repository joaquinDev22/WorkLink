// Proyecto & PostulacionProyecto DTO contracts
export type EstadoProyecto =
  | 'BUSCANDO_TALENTO'
  | 'EN_PROGRESO'
  | 'FINALIZADO'
  | 'CANCELADO'

// POST /api/v1/freelance/proyectos, POST /me y PUT /{id}
export interface ProyectoRequestDTO {
  nombreProyecto: string
  area: string
  descripcion: string
  presupuestoMax: number
  presupuestoMin: number
  clienteId?: number
  duracion?: string
  tipoPago?: string
  habilidades?: string[]
}

// GET /api/v1/freelance/proyectos, /me/publicados y /me/asignados
export interface ProyectoResponseDTO {
  proyectoId: number
  uuid: string
  nombreProyecto: string
  area: string
  descripcion: string
  fechaPublicacion: string // YYYY-MM-DD
  presupuestoMax: number
  presupuestoMin: number
  clienteId: number
  nombreCliente: string
  duracion?: string
  tipoPago?: string
  habilidades: string[]
  estado: EstadoProyecto
  nombreFreelancer?: string
}

// POST /api/v1/freelance/proyectos/{proyectoId}/postulaciones y /me
export interface PostulacionProyectoRequestDTO {
  descripcion: string
  costo: number
  employeeId: number
}

// GET /api/v1/freelance/proyectos/{proyectoId}/postulaciones
export interface PostulacionProyectoResponseDTO {
  postulacionId: number
  descripcion: string
  costoPropuesto: number
  fechaPostulacion: string // YYYY-MM-DD
  empleadoId: number
  nombreEmpleado: string
  proyectoId: number
}
