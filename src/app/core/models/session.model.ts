import { UserRole } from "./user-role";

export interface Session {
    token: string
    nombreUsuario: string
    rol: UserRole
}
