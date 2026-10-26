import { TokenStorage } from './../../../core/auth/services/token-storage';
import { inject, Service, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { PerfilUsuarioDTO } from '../models/perfil.models';
import { Observable, of, tap } from 'rxjs';

@Service()
export class Perfil {
    readonly API_URL = `${environment.apiUrl}/perfiles`

    protected client = inject(HttpClient)
    private TokenStorage = inject(TokenStorage)

    readonly perfilActual = signal<PerfilUsuarioDTO | null>(null)

    cargarPerfil() : Observable<PerfilUsuarioDTO>{
        return this.getProfile().pipe(
            tap((data) => this.perfilActual.set(data))
        )
    }

    getProfile() : Observable<PerfilUsuarioDTO>{
        // Soporte para Development Mode con bypassAuth
        if (environment.bypassAuth) {
            const session = this.TokenStorage.getSession()
            const mockPerfil: PerfilUsuarioDTO = {
                nombre: session?.nombreUsuario || 'Usuario Desarrollador',
                email: 'dev@worklink.app',
                rol: session?.rol || 'FREELANCER',
                descripcion: 'Desarrollador Full Stack apasionado por Angular y Spring Boot.',
                ubicacion: 'Buenos Aires, Argentina',
                habilidades: [
                    { habilidadId: 1, nombre: 'Angular v22', nivel: 4 },
                    { habilidadId: 2, nombre: 'TypeScript', nivel: 3 },
                    { habilidadId: 3, nombre: 'Spring Boot 3', nivel: 3 }
                ],
                proyectos: [
                    {
                        id: 1,
                        nombre: 'WorkLink Platform',
                        descripcion: 'Plataforma para freelancers y empresas con hitos seguros.'
                    }
                ]
            }
            return of(mockPerfil)
        }
        return this.client.get<PerfilUsuarioDTO>(`${this.API_URL}/getProfile`)
    }

}
