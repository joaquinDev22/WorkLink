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
})
