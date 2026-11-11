import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { environment } from '../../../../../../environments/environment'
import { FreelancerFinances } from './freelancer-finances'

describe('FreelancerFinances', () => {
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FreelancerFinances],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('loads real balance, pending, transactions, and filters transactions accurately', () => {
    const fixture = TestBed.createComponent(FreelancerFinances)
    fixture.detectChanges()

    httpMock.expectOne(`${environment.apiUrl}/freelancer/finances`).flush({
      balance: 1850,
      pending: 1200,
      withdrawn: 1850
    })

    httpMock.expectOne(`${environment.apiUrl}/freelancer/transactions`).flush([
      {
        id: 10,
        currency: 'PESOS',
        amount: 55000,
        paymentMethod: 'BILLETERA_VIRTUAL',
        projectId: 5,
        projectTitle: 'Backend Java'
      },
      {
        id: 11,
        currency: 'USD',
        amount: 800,
        paymentMethod: 'TARJETA',
        projectId: 6,
        projectTitle: 'Frontend Angular'
      }
    ])

    httpMock.expectOne(`${environment.apiUrl}/freelancer/medios-cobro`).flush(null, {
      status: 204,
      statusText: 'No Content'
    })
    httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/me/asignados`).flush([])

    fixture.detectChanges()
    const comp = fixture.componentInstance

    expect(comp.finances()?.balance).toBe(1850)
    expect(comp.finances()?.pending).toBe(1200)
    expect(comp.transaccionesFiltradas().length).toBe(2)

    comp.filtroMetodo.set('TARJETA')
    expect(comp.transaccionesFiltradas().length).toBe(1)
    expect(comp.transaccionesFiltradas()[0].id).toBe(11)

    comp.filtroMetodo.set('TODOS')
    comp.filtroMoneda.set('PESOS')
    expect(comp.transaccionesFiltradas().length).toBe(1)
    expect(comp.transaccionesFiltradas()[0].id).toBe(10)

    comp.busqueda.set('inexistente')
    expect(comp.transaccionesFiltradas().length).toBe(0)
    expect(comp.hayFiltrosActivos()).toBe(true)

    comp.limpiarFiltros()
    expect(comp.transaccionesFiltradas().length).toBe(2)

    const text = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(text).not.toContain('Retirado')
    expect(text).toContain('Sin configurar')

    // Configura un medio de cobro válido y verifica que se envíe por PUT y actualice la tarjeta
    comp.abrirModalCobros()
    comp.cobroTitular.set('Joaquín Nieva')
    comp.cobroAlias.set('joaquin.worklink.mp')
    comp.guardarMedioCobro(new Event('submit'))

    const putReq = httpMock.expectOne(`${environment.apiUrl}/freelancer/medios-cobro`)
    expect(putReq.request.method).toBe('PUT')
    expect(putReq.request.body).toEqual({
      tipo: 'TRANSFERENCIA',
      titular: 'Joaquín Nieva',
      documentoTitular: null,
      cbuCvu: null,
      alias: 'joaquin.worklink.mp',
      mercadoPagoEmail: null
    })
    putReq.flush({
      id: 3,
      freelancerId: 9,
      tipo: 'TRANSFERENCIA',
      titular: 'Joaquín Nieva',
      documentoTitular: null,
      cbuCvu: null,
      alias: 'joaquin.worklink.mp',
      mercadoPagoEmail: null
    })

    fixture.detectChanges()
    const updatedText = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(updatedText).toContain('Configurado')
    expect(updatedText).toContain('joaquin.worklink.mp')
  })

  it('shows an error alert instead of empty state when transactions fail while finances succeed', () => {
    const fixture = TestBed.createComponent(FreelancerFinances)
    fixture.detectChanges()

    httpMock.expectOne(`${environment.apiUrl}/freelancer/finances`).flush({
      balance: 0,
      pending: 500
    })
    httpMock
      .expectOne(`${environment.apiUrl}/freelancer/transactions`)
      .flush('Error', { status: 500, statusText: 'Server Error' })
    httpMock.expectOne(`${environment.apiUrl}/freelancer/medios-cobro`).flush(null)
    httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/me/asignados`).flush([])

    fixture.detectChanges()
    const comp = fixture.componentInstance
    const text = (fixture.nativeElement as HTMLElement).textContent || ''

    expect(comp.errorCarga()).toBeNull()
    expect(comp.transactionsError()).toContain('No pudimos cargar el historial')
    expect(text).toContain('No pudimos cargar el historial de transacciones')
    expect(text).not.toContain('Todavía no tenés transacciones registradas')
  })
})
