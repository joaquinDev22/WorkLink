import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { delay, finalize, map, Observable, of, tap } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import {
  FreelancerFinancesResponseDTO,
  FreelancerTransactionResponseDTO,
  MedioCobroRequestDTO,
  MedioCobroResponseDTO
} from '../models/finances.models'

@Service()
export class Finances {
  readonly API_URL = `${environment.apiUrl}/freelancer`
  protected client = inject(HttpClient)

  readonly balance = signal<FreelancerFinancesResponseDTO | null>(null)
  readonly transactions = signal<FreelancerTransactionResponseDTO[]>([])
  readonly medioCobro = signal<MedioCobroResponseDTO | null>(null)
  readonly isLoading = signal<boolean>(false)

  private readonly mockFinances: FreelancerFinancesResponseDTO = {
    balance: 1450,
    pending: 1300
  }

  private readonly mockTransactions: FreelancerTransactionResponseDTO[] = [
    {
      id: 401,
      currency: 'USD',
      amount: 450,
      paymentMethod: 'BILLETERA_VIRTUAL',
      projectId: 103,
      projectTitle: 'Frontend'
    },
    {
      id: 388,
      currency: 'USD',
      amount: 1000,
      paymentMethod: 'TARJETA',
      projectId: 101,
      projectTitle: 'Frontend'
    }
  ]

  // GET /api/v1/freelancer/finances - Balance financiero del freelancer
  getFinances(): Observable<FreelancerFinancesResponseDTO> {
    this.isLoading.set(true)
    if (environment.bypassAuth) {
      return of(this.mockFinances).pipe(
        delay(180),
        tap((data) => this.balance.set(data)),
        finalize(() => this.isLoading.set(false))
      )
    }

    return this.client.get<FreelancerFinancesResponseDTO>(`${this.API_URL}/finances`).pipe(
      tap((data) => this.balance.set(data)),
      finalize(() => this.isLoading.set(false))
    )
  }

  // GET /api/v1/freelancer/transactions - Historial real de transacciones del freelancer
  getTransactions(): Observable<FreelancerTransactionResponseDTO[]> {
    if (environment.bypassAuth) {
      return of(this.mockTransactions).pipe(
        delay(200),
        tap((data) => this.transactions.set(data))
      )
    }

    return this.client
      .get<FreelancerTransactionResponseDTO[]>(`${this.API_URL}/transactions`)
      .pipe(tap((data) => this.transactions.set(Array.isArray(data) ? data : [])))
  }

  // GET /api/v1/freelancer/medios-cobro - Datos de cobro configurados (204 si no existen)
  getMedioCobro(): Observable<MedioCobroResponseDTO | null> {
    if (environment.bypassAuth) {
      return of(this.medioCobro()).pipe(delay(120))
    }

    return this.client.get<MedioCobroResponseDTO>(`${this.API_URL}/medios-cobro`).pipe(
      map((data) => data ?? null),
      tap((data) => this.medioCobro.set(data))
    )
  }

  // PUT /api/v1/freelancer/medios-cobro - Registrar o actualizar datos de cobro (upsert)
  saveMedioCobro(datos: MedioCobroRequestDTO): Observable<MedioCobroResponseDTO> {
    if (environment.bypassAuth) {
      const saved: MedioCobroResponseDTO = {
        id: this.medioCobro()?.id ?? 1,
        freelancerId: 1,
        ...datos,
        updatedAt: new Date().toISOString()
      }
      return of(saved).pipe(
        delay(150),
        tap((data) => this.medioCobro.set(data))
      )
    }

    return this.client
      .put<MedioCobroResponseDTO>(`${this.API_URL}/medios-cobro`, datos)
      .pipe(tap((data) => this.medioCobro.set(data)))
  }

  // DELETE /api/v1/freelancer/medios-cobro - Eliminar datos de cobro
  deleteMedioCobro(): Observable<void> {
    if (environment.bypassAuth) {
      return of(void 0).pipe(
        delay(120),
        tap(() => this.medioCobro.set(null))
      )
    }

    return this.client
      .delete<void>(`${this.API_URL}/medios-cobro`)
      .pipe(tap(() => this.medioCobro.set(null)))
  }
}
