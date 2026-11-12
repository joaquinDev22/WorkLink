import { inject, Service, signal } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { delay, finalize, Observable, of, tap } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import {
  MercadoPagoPreferenceResponseDTO,
  PagosRequestDTO,
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
          moneda: 'USD',
          monto: 450,
          medioDePago: 'BILLETERA_VIRTUAL',
          proyectoId: 103
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

  // POST /api/v1/freelance/proyectos/{proyectoId}/pagos - Registrar pago directo
  registrarPago(proyectoId: number, dto: PagosRequestDTO): Observable<PagosResponseDTO> {
    this.isMutating.set(true)
    if (environment.bypassAuth) {
      const nuevo: PagosResponseDTO = {
        pagoId: Math.floor(Math.random() * 9000) + 500,
        moneda: dto.moneda,
        monto: dto.monto,
        medioDePago: dto.medioDePago,
        proyectoId
      }
      const actuales = this.mockPagosByProyecto.get(proyectoId) ?? []
      this.mockPagosByProyecto.set(proyectoId, [nuevo, ...actuales])
      return of(nuevo).pipe(
        delay(250),
        finalize(() => this.isMutating.set(false))
      )
    }

    return this.client
      .post<PagosResponseDTO>(`${this.API_URL}/${proyectoId}/pagos`, dto)
      .pipe(finalize(() => this.isMutating.set(false)))
  }

  // POST /api/v1/freelance/proyectos/{proyectoId}/pagos/checkout?monto={monto}&backUrl={url}
  crearCheckoutPreference(
    proyectoId: number,
    monto?: number,
    backUrl?: string
  ): Observable<MercadoPagoPreferenceResponseDTO> {
    this.isMutating.set(true)
    if (environment.bypassAuth) {
      const resolvedBase = (backUrl || `${window.location.origin}/freelance`).replace(/\/+$/, '')
      const mockPref: MercadoPagoPreferenceResponseDTO = {
        preferenceId: `mock-pref-${proyectoId}-${Date.now()}`,
        initPoint: `${resolvedBase}/pagos/success?external_reference=${proyectoId}&status=approved&payment_id=mock-998811&preference_id=mock-pref-${proyectoId}`,
        sandboxInitPoint: `${resolvedBase}/pagos/success?external_reference=${proyectoId}&status=approved&payment_id=mock-998811&preference_id=mock-pref-${proyectoId}`
      }
      return of(mockPref).pipe(
        delay(250),
        tap(() => {
          const actuales = this.mockPagosByProyecto.get(proyectoId) ?? []
          const montoPago = monto && monto > 0 ? monto : 650
          if (actuales.length < 2) {
            this.mockPagosByProyecto.set(proyectoId, [
              {
                pagoId: Math.floor(Math.random() * 9000) + 600,
                moneda: 'PESOS',
                monto: montoPago,
                medioDePago: 'BILLETERA_VIRTUAL',
                proyectoId
              },
              ...actuales
            ])
          }
        }),
        finalize(() => this.isMutating.set(false))
      )
    }

    let params = new HttpParams()
    if (monto !== undefined && monto !== null && monto > 0) {
      params = params.set('monto', monto.toString())
    }
    if (backUrl) {
      params = params.set('backUrl', backUrl.replace(/\/+$/, ''))
    }

    return this.client
      .post<MercadoPagoPreferenceResponseDTO>(
        `${this.API_URL}/${proyectoId}/pagos/checkout`,
        null,
        { params }
      )
      .pipe(finalize(() => this.isMutating.set(false)))
  }
}
