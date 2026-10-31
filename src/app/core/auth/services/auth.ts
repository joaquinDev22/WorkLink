import { inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorage } from './token-storage';
import { HttpClient } from '@angular/common/http';
import { Session } from '../../models/session.model';
import { GoogleLoginRequestDTO, LoginRequestDTO, LoginResponseDTO, RegisterRequestDTO } from '../../../features/auth/models/auth.models';
import { of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserRole } from '../../models/user-role';

@Service()
export class Auth {
    private http = inject(HttpClient);
    private router = inject(Router);
    private tokenStorage = inject(TokenStorage);
    private readonly apiUrl = `${environment.apiUrl}/auth`;

    // Signal con tu Session tipada
    session = signal<Session | null>(this.tokenStorage.getSession());
    
    cambiarRol(nuevoRol: UserRole): void {
        const actual = this.session();
        if (!actual) return;
        const actualizada: Session = {
            ...actual,
            rol: nuevoRol
        };
        this.tokenStorage.saveSession(actualizada);
        this.session.set(actualizada);
        // Redirección inmediata al panel del nuevo rol
        this.redirigirSegunRol(nuevoRol);
    }

    redirigirSegunRol(rol : UserRole){
        if (rol === 'POSTULANTE') {
            this.router.navigate(['/enterprise/catalogo'])
        } else if (rol === 'FREELANCER') {
            this.router.navigate(['/freelance/proyectos'])
        }
    }

    login(credenciales: LoginRequestDTO) {
        if (environment.bypassAuth) {
            const mockRes: LoginResponseDTO = {
                mensaje:'',
                token: 'mock-jwt-token-develop-123456789',
                nombreUsuario: credenciales.usuario || 'UsuarioDev',
                rol: 'POSTULANTE'
            }
            this.guardarSesion(mockRes)
            return of(mockRes)
        }

        return this.http.post<LoginResponseDTO>(`${this.apiUrl}/login`, credenciales).pipe(
            tap((res) => this.guardarSesion(res))
        );
    }

    loginGoogle(idToken: string) {
        if (environment.bypassAuth) {
            const mockRes: LoginResponseDTO = {
                mensaje:'',
                token: 'mock-google-jwt-develop',
                nombreUsuario: 'GoogleUserDev',
                rol: 'POSTULANTE'
            }
            this.guardarSesion(mockRes)
            return of(mockRes)
        }

        const body: GoogleLoginRequestDTO = { idToken };
        return this.http.post<LoginResponseDTO>(`${this.apiUrl}/google`, body).pipe(
            tap((res) => this.guardarSesion(res))
        )
    }

    private guardarSesion(res: LoginResponseDTO): void {
        const session: Session = {
            token: res.token,
            nombreUsuario: res.nombreUsuario,
            rol: res.rol
        };

        this.tokenStorage.saveSession(session);
        this.session.set(session);

        // Redirección inteligente al área privada según su rol:
        if (session.rol === 'EMPRESA') {
            this.router.navigate(['/enterprise/dashboard']);
        } else if (session.rol === 'RECRUITER') {
            this.router.navigate(['/enterprise/vacantes']);
        } else if (session.rol === 'CLIENTE') {
            this.router.navigate(['/freelance/cliente-dashboard']);
        } else {
            this.router.navigate(['/freelance/proyectos']);
        }
    }
    
    logout(): void {
        this.tokenStorage.clear()
        this.session.set(null)
        this.router.navigate(['/auth/login'])
    }

    register(cuenta : RegisterRequestDTO){
        if (environment.bypassAuth) {
            const mockRes: LoginResponseDTO = {
                mensaje:'Usuario Registrado Exitosamente',
                token: 'mock-google-jwt-develop',
                nombreUsuario: cuenta.usuario,
                rol: cuenta.rol
            }
            this.guardarSesion(mockRes)
            return of(mockRes)
        }
        return this.http.post<LoginResponseDTO>(`${this.apiUrl}/register`,cuenta).pipe(
            tap((res) => this.guardarSesion(res))
        )
    }
}
