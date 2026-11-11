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
  estado?: string
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
  calificacionId: number
  puntaje: number
  comentario: string
  fechaComentario?: string
  proyectoId?: number
}

export const ESTADO_PROYECTO_CONFIG: Record<
  EstadoProyecto,
  { label: string; badgeClass: string; dotClass: string }
> = {
  BUSCANDO_TALENTO: {
    label: 'Buscando talento',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dotClass: 'bg-emerald-500'
  },
  EN_PROGRESO: {
    label: 'En progreso',
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200',
    dotClass: 'bg-sky-500'
  },
  FINALIZADO: {
    label: 'Finalizado',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    dotClass: 'bg-slate-500'
  },
  CANCELADO: {
    label: 'Cancelado',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
    dotClass: 'bg-rose-500'
  }
}

export const ESTADO_HITO_CONFIG: Record<EstadoHito, { label: string; badgeClass: string }> = {
  PENDIENTE: {
    label: 'Pendiente',
    badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200'
  },
  COMPLETADO: {
    label: 'Entregado (por aprobar)',
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200'
  },
  PAGADO: {
    label: 'Aprobado y Pagado',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }
}

export function formatFechaProyecto(fechaStr?: string, mesLargo = false): string {
  if (!fechaStr) return 'Reciente'
  const parsed = new Date(fechaStr.includes('T') ? fechaStr : `${fechaStr}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return fechaStr
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: mesLargo ? 'long' : 'short',
    year: 'numeric'
  }).format(parsed)
}
