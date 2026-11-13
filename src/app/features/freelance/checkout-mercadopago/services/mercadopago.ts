import { inject, Service, signal } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { delay, finalize, Observable, of } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import {
  MercadoPagoPreferenceResponseDTO,
  PagosResponseDTO
} from '../models/mercadopago.models'

@Service()
export class Mercadopago {
  readonly API_URL = `${environment.apiUrl}/freelance/proyectos`
  protected client = inject(HttpClient)

  readonly isLoading = signal<boolean>(false)
  readonly isMutating = signal<boolean>(false)

  // GET /api/v1/freelance/proyectos/{proyectoId}/pagos - Historial de pagos
  getPagos(proyectoId: number): Observable<PagosResponseDTO[]> {
    this.isLoading.set(true)

    return this.client
      .get<PagosResponseDTO[]>(`${this.API_URL}/${proyectoId}/pagos`)
      .pipe(finalize(() => this.isLoading.set(false)))
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/pagos/checkout?hitoId=N - Paga por adelantado el próximo hito
  crearCheckoutPreference(proyectoId: number, hitoId: number): Observable<MercadoPagoPreferenceResponseDTO> {
    this.isMutating.set(true)

    return this.client
      .post<MercadoPagoPreferenceResponseDTO>(`${this.API_URL}/${proyectoId}/pagos/checkout`, null, {
        params: new HttpParams().set('hitoId', hitoId)
      })
      .pipe(finalize(() => this.isMutating.set(false)))
  }
}
