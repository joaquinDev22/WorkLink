import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { environment } from '../../../../../../environments/environment'
import { MpCheckoutButton } from './mp-checkout-button'

describe('MpCheckoutButton', () => {
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MpCheckoutButton],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('emits checkoutError and skips HTTP when monto is <= 0', () => {
    const fixture = TestBed.createComponent(MpCheckoutButton)
    fixture.componentRef.setInput('proyectoId', 55)
    fixture.componentRef.setInput('monto', 0)
    fixture.detectChanges()

    let emittedError: string | undefined
    fixture.componentInstance.checkoutError.subscribe((e) => (emittedError = e))

    fixture.componentInstance.iniciarCheckout()
    expect(emittedError).toContain('mayor a 0')
  })

  it('sanitizes backend exception errors instead of leaking stack noise', () => {
    const fixture = TestBed.createComponent(MpCheckoutButton)
    fixture.componentRef.setInput('proyectoId', 55)
    fixture.componentRef.setInput('monto', 500)
    fixture.detectChanges()

    let emittedError: string | undefined
    fixture.componentInstance.checkoutError.subscribe((e) => (emittedError = e))

    fixture.componentInstance.iniciarCheckout()

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/freelance/proyectos/55/pagos/checkout` &&
        r.params.get('monto') === '500' &&
        r.params.get('backUrl') === `${window.location.origin}/freelance`
    )
    req.flush(
      { message: 'java.lang.NullPointerException: stack trace' },
      { status: 400, statusText: 'Bad Request' }
    )

    expect(emittedError).toBe(
      'No pudimos conectar con MercadoPago Checkout Pro. Verificá los datos o probá registrar el pago directo.'
    )
    expect(fixture.componentInstance.isRedirecting()).toBe(false)
  })

  it('rejects non-http(s) checkout URLs instead of redirecting', () => {
    const fixture = TestBed.createComponent(MpCheckoutButton)
    fixture.componentRef.setInput('proyectoId', 55)
    fixture.componentRef.setInput('monto', 500)
    fixture.detectChanges()

    let emittedError: string | undefined
    fixture.componentInstance.checkoutError.subscribe((e) => (emittedError = e))

    fixture.componentInstance.iniciarCheckout()

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/freelance/proyectos/55/pagos/checkout`
    )
    req.flush({
      preferenceId: 'pref-bad',
      initPoint: 'javascript:alert(1)',
      sandboxInitPoint: ''
    })

    expect(emittedError).toContain('URL válida')
    expect(fixture.componentInstance.isRedirecting()).toBe(false)
  })
})
