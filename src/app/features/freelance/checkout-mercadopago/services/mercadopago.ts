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

  private mockPagosByProyecto = new Map<number, PagosResponseDTO[]>([
    [
      103,
      [
        {
          pagoId: 401,
          moneda: 'PESOS',
          monto: 450,
          medioDePago: 'BILLETERA_VIRTUAL',
          proyectoId: 103,
          mpPaymentId: 'mock-401',
          fecha: '2026-11-05T14:30:00'
        }
      ]
    ]
  ])

  // GET /api/v1/freelance/proyectos/{proyectoId}/pagos - Historial de pagos
  getPagos(proyectoId: number): Observable<PagosResponseDTO[]> {
    this.isLoading.set(true)
    if (environment.bypassAuth) {
      const list = this.mockPagosByProyecto.get(proyectoId) ?? []
      return of([...list]).pipe(
        delay(180),
        finalize(() => this.isLoading.set(false))
      )
    }

    return this.client
      .get<PagosResponseDTO[]>(`${this.API_URL}/${proyectoId}/pagos`)
      .pipe(finalize(() => this.isLoading.set(false)))
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/pagos/checkout?hitoId=N - Paga por adelantado el próximo hito
  crearCheckoutPreference(proyectoId: number, hitoId: number): Observable<MercadoPagoPreferenceResponseDTO> {
    this.isMutating.set(true)
    if (environment.bypassAuth) {
      const retorno = `${window.location.origin}/freelance/pagos/success?external_reference=${proyectoId}-${hitoId}&status=approved&payment_id=mock-998811`
      return of({ preferenceId: `mock-pref-${proyectoId}-${hitoId}`, initPoint: retorno, sandboxInitPoint: retorno }).pipe(
        delay(250),
        finalize(() => this.isMutating.set(false))
      )
    }

    return this.client
      .post<MercadoPagoPreferenceResponseDTO>(`${this.API_URL}/${proyectoId}/pagos/checkout`, null, {
        params: new HttpParams().set('hitoId', hitoId)
      })
      .pipe(finalize(() => this.isMutating.set(false)))
  }
}
