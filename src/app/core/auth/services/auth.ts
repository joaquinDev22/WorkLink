import { inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TokenStorage } from './token-storage';
import { HttpClient } from '@angular/common/http';
import { Session } from '../../models/session.model';
import { GoogleLoginRequestDTO, LoginRequestDTO, LoginResponseDTO } from '../../../features/auth/models/auth.models';
import { tap } from 'rxjs';

@Service()
export class Auth {
    private http = inject(HttpClient);
    private router = inject(Router);
    private tokenStorage = inject(TokenStorage);
    private readonly apiUrl = `${environment.apiUrl}/auth`;

    // Signal con tu Session tipada
    session = signal<Session | null>(this.tokenStorage.getSession());

    login(credenciales: LoginRequestDTO) {
        return this.http.post<LoginResponseDTO>(`${this.apiUrl}/login`, credenciales).pipe(
            tap((res) => this.guardarSesion(res))
        );
    }

    loginGoogle(idToken: string) {
        const body: GoogleLoginRequestDTO = { idToken };
        return this.http.post<LoginResponseDTO>(`${this.apiUrl}/google`, body).pipe(
            tap((res) => this.guardarSesion(res))
        );
    }

    private guardarSesion(res: LoginResponseDTO): void {
        const session: Session = {
            token: res.token,
            nombreUsuario: res.nombreUsuario,
            rol: res.rol
        };
        this.tokenStorage.saveSession(session);
        this.session.set(session);
        this.router.navigate(['/']);
    }
    
    logout(): void {
        this.tokenStorage.clear();
        this.session.set(null);
        this.router.navigate(['/auth/login']);
    }
}
