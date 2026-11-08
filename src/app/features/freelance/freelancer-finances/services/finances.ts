import { inject, Service, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { FreelancerFinancesResponseDTO } from '../models/finances.models'

@Service()
export class Finances {
  readonly API_URL = `${environment.apiUrl}/freelancer/finances`
  protected client = inject(HttpClient)

  readonly balance = signal<FreelancerFinancesResponseDTO | null>(null)
  readonly isLoading = signal<boolean>(false)

  // GET /api/v1/freelancer/finances - Balance financiero del freelancer
  getFinances(): Observable<FreelancerFinancesResponseDTO> {
    return this.client.get<FreelancerFinancesResponseDTO>(this.API_URL)
  }
}
