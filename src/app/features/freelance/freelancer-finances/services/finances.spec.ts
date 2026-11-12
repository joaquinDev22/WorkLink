import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { environment } from '../../../../../environments/environment'
import { Finances } from './finances'

describe('Finances service', () => {
  let service: Finances
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), Finances]
    })
    service = TestBed.inject(Finances)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('fetches real freelancer finances and updates balance signal', () => {
    const mockFin = { balance: 2500, pending: 900, withdrawn: 2500 }

    let result: unknown
    service.getFinances().subscribe((res) => (result = res))

    const req = httpMock.expectOne(`${environment.apiUrl}/freelancer/finances`)
    expect(req.request.method).toBe('GET')
    req.flush(mockFin)

    expect(result).toEqual(mockFin)
    expect(service.balance()).toEqual(mockFin)
    expect(service.isLoading()).toBe(false)
  })

  it('fetches real freelancer transactions and updates transactions signal', () => {
    const mockTx = [
      {
        id: 10,
        currency: 'PESOS',
        amount: 45000,
        paymentMethod: 'BILLETERA_VIRTUAL',
        projectId: 5,
        projectTitle: 'Backend Java'
      }
    ]

    let result: unknown
    service.getTransactions().subscribe((res) => (result = res))

    const req = httpMock.expectOne(`${environment.apiUrl}/freelancer/transactions`)
    expect(req.request.method).toBe('GET')
    req.flush(mockTx)

    expect(result).toEqual(mockTx)
    expect(service.transactions()).toEqual(mockTx)
  })

  it('fetches, saves (PUT), and deletes freelancer payout settings via /medios-cobro', () => {
    service.getMedioCobro().subscribe()
    const getReq = httpMock.expectOne(`${environment.apiUrl}/freelancer/medios-cobro`)
    expect(getReq.request.method).toBe('GET')
    getReq.flush(null, { status: 204, statusText: 'No Content' })
    expect(service.medioCobro()).toBeNull()

    const payload = {
      tipo: 'TRANSFERENCIA' as const,
      titular: 'Joaquín Nieva',
      documentoTitular: '40123456',
      cbuCvu: '0000003100012345678901',
      alias: 'joaquin.dev.mp',
      mercadoPagoEmail: null
    }
    const saved = { id: 7, freelancerId: 12, ...payload }

    service.saveMedioCobro(payload).subscribe()
    const putReq = httpMock.expectOne(`${environment.apiUrl}/freelancer/medios-cobro`)
    expect(putReq.request.method).toBe('PUT')
    expect(putReq.request.body).toEqual(payload)
    putReq.flush(saved)
    expect(service.medioCobro()).toEqual(saved)

    service.deleteMedioCobro().subscribe()
    const delReq = httpMock.expectOne(`${environment.apiUrl}/freelancer/medios-cobro`)
    expect(delReq.request.method).toBe('DELETE')
    delReq.flush(null, { status: 204, statusText: 'No Content' })
    expect(service.medioCobro()).toBeNull()
  })
})
