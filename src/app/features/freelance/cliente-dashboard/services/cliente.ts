import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { delay, finalize, Observable, of, tap } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import {
  ClientDashboardResponseDTO,
  ClientProfileRequestDTO,
  ClientProfileResponseDTO
} from '../models/cliente-dashboard.models'

@Service()
export class Cliente {
  readonly API_URL = `${environment.apiUrl}/client`
  protected client = inject(HttpClient)

  readonly stats = signal<ClientDashboardResponseDTO | null>(null)
  readonly perfil = signal<ClientProfileResponseDTO | null>(null)
  readonly isLoading = signal<boolean>(false)
  readonly isMutating = signal<boolean>(false)

  // GET /api/v1/client/dashboard - Métricas del panel cliente
  getDashboard(): Observable<ClientDashboardResponseDTO> {
    this.isLoading.set(true)

    return this.client.get<ClientDashboardResponseDTO>(`${this.API_URL}/dashboard`).pipe(
      tap((data) => this.stats.set(data)),
      finalize(() => this.isLoading.set(false))
    )
  }

  // GET /api/v1/client/me - Datos del perfil de cliente
  getMiPerfilCliente(): Observable<ClientProfileResponseDTO> {
    return this.client.get<ClientProfileResponseDTO>(`${this.API_URL}/me`).pipe(
      tap((data) => this.perfil.set(data))
    )
  }

  // PUT /api/v1/client/me - Actualizar perfil de cliente
  actualizarPerfilCliente(datos: ClientProfileRequestDTO): Observable<ClientProfileResponseDTO> {
    this.isMutating.set(true)

    return this.client.put<ClientProfileResponseDTO>(`${this.API_URL}/me`, datos).pipe(
      tap((data) => this.perfil.set(data)),
      finalize(() => this.isMutating.set(false))
    )
  }
}
