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

  private readonly mockStats: ClientDashboardResponseDTO = {
    activeProjects: 2,
    completedProjects: 5,
    totalSpent: 6450,
    pendingProposals: 4
  }

  private readonly mockPerfil: ClientProfileResponseDTO = {
    clienteId: 12,
    firstName: 'Lucía',
    lastName: 'Fernández',
    email: 'lucia.fernandez@innovatech.ar',
    phoneNumber: '+54 11 5555-0192',
    country: 'Argentina',
    fechaNacimiento: '1992-05-14',
    perfilId: 40,
    username: 'lucia.client'
  }

  // GET /api/v1/client/dashboard - Métricas del panel cliente
  getDashboard(): Observable<ClientDashboardResponseDTO> {
    this.isLoading.set(true)
    if (environment.bypassAuth) {
      return of(this.mockStats).pipe(
        delay(200),
        tap((data) => this.stats.set(data)),
        finalize(() => this.isLoading.set(false))
      )
    }

    return this.client.get<ClientDashboardResponseDTO>(`${this.API_URL}/dashboard`).pipe(
      tap((data) => this.stats.set(data)),
      finalize(() => this.isLoading.set(false))
    )
  }

  // GET /api/v1/client/me - Datos del perfil de cliente
  getMiPerfilCliente(): Observable<ClientProfileResponseDTO> {
    if (environment.bypassAuth) {
      return of(this.mockPerfil).pipe(
        delay(150),
        tap((data) => this.perfil.set(data))
      )
    }

    return this.client.get<ClientProfileResponseDTO>(`${this.API_URL}/me`).pipe(
      tap((data) => this.perfil.set(data))
    )
  }

  // PUT /api/v1/client/me - Actualizar perfil de cliente
  actualizarPerfilCliente(datos: ClientProfileRequestDTO): Observable<ClientProfileResponseDTO> {
    this.isMutating.set(true)
    if (environment.bypassAuth) {
      const updated: ClientProfileResponseDTO = { ...this.mockPerfil, ...datos }
      return of(updated).pipe(
        delay(250),
        tap((data) => this.perfil.set(data)),
        finalize(() => this.isMutating.set(false))
      )
    }

    return this.client.put<ClientProfileResponseDTO>(`${this.API_URL}/me`, datos).pipe(
      tap((data) => this.perfil.set(data)),
      finalize(() => this.isMutating.set(false))
    )
  }
}
