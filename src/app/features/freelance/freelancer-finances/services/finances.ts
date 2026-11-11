import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { delay, finalize, Observable, of, tap } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import {
  FreelancerFinancesResponseDTO,
  FreelancerTransactionResponseDTO
} from '../models/finances.models'

@Service()
export class Finances {
  readonly API_URL = `${environment.apiUrl}/freelancer`
  protected client = inject(HttpClient)

  readonly balance = signal<FreelancerFinancesResponseDTO | null>(null)
  readonly transactions = signal<FreelancerTransactionResponseDTO[]>([])
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
}
