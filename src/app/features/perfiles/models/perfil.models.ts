// Perfil DTO contracts
export type NivelHabilidad = 1 | 2 | 3 | 4 // 1: Básico, 2: Intermedio, 3: Avanzado, 4: Experto

export interface PerfilHabilidadDTO {
  habilidadId: number
  nombre: string
  nivel: NivelHabilidad
}

export interface PerfilProyectoPortafolioDTO {
  id: number
  nombre: string
  descripcion: string
  link?: string
  imagen?: string // byte[] serializado en Base64
}

// GET /api/v1/perfiles/getProfile y PUT /api/v1/perfiles/updateProfile
export interface PerfilUsuarioDTO {
  nombre: string
  apellido?: string
  email: string
  rol: string
  fechaNacimiento?: string // YYYY-MM-DD (Employee / Recruiter)
  telefono?: string        // Cliente / Empresa
  pais?: string            // Cliente / Empresa
  descripcion?: string
  ubicacion?: string
  sitioWeb?: string        // Empresa
  logo?: string            // Empresa
  fotoPerfil?: string      // byte[] en Base64
  bannerPerfil?: string    // byte[] en Base64
  habilidades: PerfilHabilidadDTO[]
  proyectos: PerfilProyectoPortafolioDTO[]
}

export interface ItemFaltantePerfil {
  label: string
  clave: string
}

export interface PerfilCompletitud {
  porcentaje: number
  completado: boolean
  itemsFaltantes: ItemFaltantePerfil[]
}
