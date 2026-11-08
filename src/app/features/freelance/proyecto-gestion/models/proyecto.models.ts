// Proyecto & PostulacionProyecto DTO contracts
export type EstadoProyecto =
  | 'BUSCANDO_TALENTO'
  | 'EN_PROGRESO'
  | 'FINALIZADO'
  | 'CANCELADO'

// POST /api/v1/freelance/proyectos, POST /me y PUT /{id}
export interface ProyectoRequestDTO {
  nombreProyecto?: string
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
  nombreProyecto?: string
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

// Hitos: GET / POST / PUT /api/v1/freelance/proyectos/{proyectoId}/hitos
export type EstadoHito = 'PENDIENTE' | 'COMPLETADO' | 'PAGADO'

export interface HitoRequestDTO {
  titulo: string
  descripcion: string
  monto: number
  fechaLimite: string // YYYY-MM-DD
}

export interface HitoResponseDTO {
  hitoId: number
  titulo: string
  descripcion: string
  monto: number
  fechaLimite: string
  estado: EstadoHito
  proyectoId: number
}

// Calificaciones: POST /api/v1/freelance/proyectos/{proyectoId}/calificar
export interface CalificacionProyectoRequestDTO {
  puntaje: number // 1..5
  comentario: string
}

export interface CalificacionProyectoResponseDTO {
  id: number
  puntaje: number
  comentario: string
  proyectoId?: number
  fecha?: string
}
