import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { environment } from '../../../../../environments/environment'
import { Mercadopago } from './mercadopago'

describe('Mercadopago service', () => {
  let service: Mercadopago
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), Mercadopago]
    })
    service = TestBed.inject(Mercadopago)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('fetches payment history for a project', () => {
    const mockPagos = [
      { pagoId: 1, moneda: 'USD' as const, monto: 500, medioDePago: 'TARJETA' as const, proyectoId: 42 }
    ]

    let result: unknown
    service.getPagos(42).subscribe((res) => (result = res))

    const req = httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/42/pagos`)
    expect(req.request.method).toBe('GET')
    req.flush(mockPagos)

    expect(result).toEqual(mockPagos)
    expect(service.isLoading()).toBe(false)
  })

  it('crea la preferencia de Checkout Pro para el hito indicado', () => {
    const prefResp = {
      preferenceId: 'pref-123',
      initPoint: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-123',
      sandboxInitPoint: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-123'
    }

    let result: unknown
    service
      .crearCheckoutPreference(42, 7)
      .subscribe((res) => (result = res))

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/freelance/proyectos/42/pagos/checkout` &&
        r.params.get('hitoId') === '7' &&
        !r.params.has('monto') &&
        !r.params.has('backUrl')
    )
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toBeNull()
    req.flush(prefResp)

    expect(result).toEqual(prefResp)
    expect(service.isMutating()).toBe(false)
  })
})
