// Auth DTO contracts
import { UserRole } from '../../../core/models/user-role'

// POST /api/v1/auth/register (PerfilRequestDTO en Backend)
export interface RegisterRequestDTO {
  usuario: string
  email: string
  password: string
  rol: UserRole
}

export interface PerfilResponseDTO {
  perfil_id: number
  usuario: string
  email: string
  rol: UserRole
}

// POST /api/v1/auth/login
export interface LoginRequestDTO {
  usuario: string
  password: string
}

// POST /api/v1/auth/google
export interface GoogleLoginRequestDTO {
  idToken: string
}

// Respuesta de /login y /google
export interface LoginResponseDTO {
  mensaje: string
  nombreUsuario: string
  rol: UserRole
  token: string
}
