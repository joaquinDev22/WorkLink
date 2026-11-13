import { inject, Service } from '@angular/core'
import { Router } from '@angular/router'
import { TokenStorage } from './token-storage'
import { HttpClient } from '@angular/common/http'
import { Session } from '../../models/session.model'
import { GoogleLoginRequestDTO, LoginRequestDTO, LoginResponseDTO, RegisterRequestDTO } from '../../../features/auth/models/auth.models'
import { of, tap } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { UserRole } from '../../models/user-role'
import { Perfil } from '../../../features/perfiles/services/perfil'

@Service()
export class Auth {
    private http = inject(HttpClient)
    private router = inject(Router)
    private tokenStorage = inject(TokenStorage)
    private perfilService = inject(Perfil)
    private readonly apiUrl = `${environment.apiUrl}/auth`

    // Signal compartida con TokenStorage para mantener reactivo el rol activo en toda la app
    session = this.tokenStorage.session
    
    cambiarRol(nuevoRol: UserRole): void {
        const actual = this.session()
        if (!actual) return
        const actualizada: Session = {
            ...actual,
            rol: nuevoRol
        }
        this.tokenStorage.saveSession(actualizada)
        this.session.set(actualizada)
        // Redirección inmediata al panel del nuevo rol
        this.redirigirSegunRol(nuevoRol)
    }

    redirigirSegunRol(rol: UserRole): void {
        if (rol === 'EMPRESA') {
            this.router.navigate(['/enterprise/dashboard'])
        } else if (rol === 'RECRUITER') {
            this.router.navigate(['/enterprise/vacantes'])
        } else if (rol === 'POSTULANTE') {
            this.router.navigate(['/enterprise/catalogo'])
        } else if (rol === 'CLIENTE') {
            this.router.navigate(['/freelance/cliente-dashboard'])
        } else {
            this.router.navigate(['/freelance/proyectos'])
        }
    }

    login(credenciales: LoginRequestDTO) {
        return this.http.post<LoginResponseDTO>(`${this.apiUrl}/login`, credenciales).pipe(
            tap((res) => this.guardarSesion(res))
        )
    }

    loginGoogle(idToken: string, rol?: UserRole) {
        const body: GoogleLoginRequestDTO = { idToken, rol }
        return this.http.post<LoginResponseDTO>(`${this.apiUrl}/google`, body).pipe(
            tap((res) => this.guardarSesion(res))
        )
    }

    private guardarSesion(res: LoginResponseDTO): void {
        const session: Session = {
            token: res.token,
            nombreUsuario: res.nombreUsuario,
            rol: res.rol
        }

        // Descarta el perfil en memoria de la sesión anterior (foto, banner, datos)
        this.perfilService.perfilActual.set(null)
        this.tokenStorage.saveSession(session)
        this.session.set(session)

        // Redirección al área privada según su rol específico
        this.redirigirSegunRol(session.rol)
    }
    
    logout(): void {
        this.tokenStorage.clear()
        this.perfilService.perfilActual.set(null)
        this.session.set(null)
        this.router.navigate(['/auth/login'])
    }

    register(cuenta: RegisterRequestDTO) {
        return this.http.post<any>(`${this.apiUrl}/register`, cuenta).pipe(
            tap((res) => {
                if (res?.token) {
                    this.guardarSesion(res)
                } else {
                    this.router.navigate(['/auth/login'])
                }
            })
        )
    }
}
