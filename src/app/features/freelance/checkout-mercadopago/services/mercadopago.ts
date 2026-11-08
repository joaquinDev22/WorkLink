import { inject, Service } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import {
  MercadoPagoPreferenceResponseDTO,
  PagosResponseDTO
} from '../models/mercadopago.models'

@Service()
export class Mercadopago {
  readonly API_URL = `${environment.apiUrl}/freelance/proyectos`
  protected client = inject(HttpClient)

  // GET /api/v1/freelance/proyectos/{proyectoId}/pagos - Historial de pagos
  getPagos(proyectoId: number): Observable<PagosResponseDTO[]> {
    return this.client.get<PagosResponseDTO[]>(`${this.API_URL}/${proyectoId}/pagos`)
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/pagos/checkout?monto={monto}&backUrl={url}
  crearCheckoutPreference(
    proyectoId: number,
    monto?: number,
    backUrl?: string
  ): Observable<MercadoPagoPreferenceResponseDTO> {
    let params = new HttpParams()
    if (monto !== undefined && monto !== null) {
      params = params.set('monto', monto.toString())
    }
    if (backUrl) {
      params = params.set('backUrl', backUrl)
    }

    return this.client.post<MercadoPagoPreferenceResponseDTO>(
      `${this.API_URL}/${proyectoId}/pagos/checkout`,
      null,
      { params }
    )
  }
}
