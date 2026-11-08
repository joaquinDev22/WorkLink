import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { ClientDashboardResponseDTO } from '../models/cliente-dashboard.models'

@Service()
export class Cliente {
  readonly API_URL = `${environment.apiUrl}/client`
  protected client = inject(HttpClient)

  readonly stats = signal<ClientDashboardResponseDTO | null>(null)
  readonly isLoading = signal<boolean>(false)

  // GET /api/v1/client/dashboard - Métricas del panel cliente
  getDashboard(): Observable<ClientDashboardResponseDTO> {
    return this.client.get<ClientDashboardResponseDTO>(`${this.API_URL}/dashboard`)
  }

  // GET /api/v1/client/me - Datos del perfil de cliente
  getMiPerfilCliente(): Observable<any> {
    return this.client.get<any>(`${this.API_URL}/me`)
  }

  // PUT /api/v1/client/me - Actualizar perfil de cliente
  actualizarPerfilCliente(datos: any): Observable<any> {
    return this.client.put<any>(`${this.API_URL}/me`, datos)
  }
}
