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

  it('registers a direct payment via POST', () => {
    const dto = { moneda: 'PESOS' as const, monto: 120000, medioDePago: 'BILLETERA_VIRTUAL' as const }
    const created = { pagoId: 77, ...dto, proyectoId: 42 }

    let result: unknown
    service.registrarPago(42, dto).subscribe((res) => (result = res))

    const req = httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/42/pagos`)
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual(dto)
    req.flush(created)

    expect(result).toEqual(created)
    expect(service.isMutating()).toBe(false)
  })

  it('creates MercadoPago checkout preference stripping trailing slashes from backUrl', () => {
    const prefResp = {
      preferenceId: 'pref-123',
      initPoint: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-123',
      sandboxInitPoint: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-123'
    }

    let result: unknown
    service
      .crearCheckoutPreference(42, 650, 'http://localhost:4200/freelance///')
      .subscribe((res) => (result = res))

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/freelance/proyectos/42/pagos/checkout` &&
        r.params.get('monto') === '650' &&
        r.params.get('backUrl') === 'http://localhost:4200/freelance'
    )
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toBeNull()
    req.flush(prefResp)

    expect(result).toEqual(prefResp)
    expect(service.isMutating()).toBe(false)
  })
})
