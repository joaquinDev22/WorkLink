import { afterEach, describe, expect, it } from 'vitest'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { Auth } from '../../../../../core/auth/services/auth'
import { environment } from '../../../../../../environments/environment'
import { ProyectoPagos } from './proyecto-pagos'

describe('ProyectoPagos', () => {
  let httpMock: HttpTestingController

  function setup(rol: 'CLIENTE' | 'FREELANCER') {
    const authMock = {
      session: () => ({ token: 'tok', nombreUsuario: 'user', rol })
    }

    TestBed.configureTestingModule({
      imports: [ProyectoPagos],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Auth, useValue: authMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '103' })
            }
          }
        }
      ]
    })

    httpMock = TestBed.inject(HttpTestingController)
    const fixture = TestBed.createComponent(ProyectoPagos)
    fixture.detectChanges()

    httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/103`).flush({
      proyectoId: 103,
      uuid: 'uuid-103',
      nombreProyecto: 'Portal Fintech',
      area: 'Frontend',
      descripcion: 'Desc',
      fechaPublicacion: '2026-11-01',
      presupuestoMin: 900,
      presupuestoMax: 1500,
      clienteId: 12,
      nombreCliente: 'Lucía',
      habilidades: [],
      estado: 'EN_PROGRESO',
      nombreFreelancer: 'Valentina'
    })

    httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/103/pagos`).flush([
      { pagoId: 1, moneda: 'USD', monto: 450, medioDePago: 'BILLETERA_VIRTUAL', proyectoId: 103 }
    ])

    httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/103/hitos`).flush([
      {
        hitoId: 11,
        titulo: 'Setup inicial',
        descripcion: 'Base',
        monto: 450,
        fechaLimite: '2026-11-18',
        estado: 'PAGADO',
        proyectoId: 103
      },
      {
        hitoId: 12,
        titulo: 'Entrega final',
        descripcion: 'Integración',
        monto: 650,
        fechaLimite: '2026-11-28',
        estado: 'COMPLETADO',
        proyectoId: 103
      }
    ])

    fixture.detectChanges()
    return fixture
  }

  afterEach(() => {
    httpMock.verify()
  })

  it('computes remaining balance, supports milestone/custom amount modes, and registers direct payment for CLIENTE', () => {
    const fixture = setup('CLIENTE')
    const comp = fixture.componentInstance

    expect(comp.puedeOperarPagos()).toBe(true)
    expect(comp.totalPlanificadoHitos()).toBe(1100)
    expect(comp.totalAbonado()).toBe(450)
    expect(comp.saldoRestante()).toBe(650)
    expect(comp.montoSeleccionado()).toBe(650)

    comp.seleccionarModoMonto('HITO')
    expect(comp.montoSeleccionado()).toBe(650)

    comp.seleccionarModoMonto('PERSONALIZADO')
    comp.montoPersonalizado.set('0')
    expect(comp.montoValido()).toBe(false)
    comp.montoPersonalizado.set('300')
    expect(comp.montoValido()).toBe(true)
    expect(comp.montoSeleccionado()).toBe(300)

    // Abre modal secundario y valida monto <= 0
    comp.abrirModalPagoDirecto()
    comp.modalMonto.set('-10')
    comp.confirmarPagoDirecto(new Event('submit'))
    expect(comp.modalError()).toContain('mayor a 0')

    // Envía pago directo válido
    comp.modalMoneda.set('USD')
    comp.modalMedio.set('TARJETA')
    comp.modalMonto.set('300')
    comp.confirmarPagoDirecto(new Event('submit'))

    const postReq = httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/103/pagos`)
    expect(postReq.request.method).toBe('POST')
    expect(postReq.request.body).toEqual({
      moneda: 'USD',
      monto: 300,
      medioDePago: 'TARJETA'
    })
    postReq.flush({ pagoId: 99, moneda: 'USD', monto: 300, medioDePago: 'TARJETA', proyectoId: 103 })

    // Refrescos posteriores
    httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/103`).flush(comp.proyecto())
    httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/103/hitos`).flush(comp.hitos())

    expect(comp.pagos().length).toBe(2)
    expect(comp.mostrarModalPagoDirecto()).toBe(false)
    expect(comp.feedbackOk()).toContain('#99')
  })

  it('hides payment controls for FREELANCER while showing payment history', () => {
    const fixture = setup('FREELANCER')
    const comp = fixture.componentInstance

    expect(comp.puedeOperarPagos()).toBe(false)
    expect(comp.pagos().length).toBe(1)
    const html = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(html).not.toContain('Registrar pago directo')
    expect(html).toContain('Historial de pagos registrados')
  })

  it('keeps loaded pagos when hitos request fails and marks covered balance without falling back to presupuestoMax', () => {
    const authMock = {
      session: () => ({ token: 'tok', nombreUsuario: 'user', rol: 'CLIENTE' as const })
    }

    TestBed.configureTestingModule({
      imports: [ProyectoPagos],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Auth, useValue: authMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '103' })
            }
          }
        }
      ]
    })

    httpMock = TestBed.inject(HttpTestingController)
    const fixture = TestBed.createComponent(ProyectoPagos)
    fixture.detectChanges()

    httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/103`).flush({
      proyectoId: 103,
      uuid: 'uuid-103',
      nombreProyecto: 'Portal Fintech',
      area: 'Frontend',
      descripcion: 'Desc',
      fechaPublicacion: '2026-11-01',
      presupuestoMin: 900,
      presupuestoMax: 1500,
      clienteId: 12,
      nombreCliente: 'Lucía',
      habilidades: [],
      estado: 'EN_PROGRESO',
      nombreFreelancer: 'Valentina'
    })

    httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/103/pagos`).flush([
      { pagoId: 1, moneda: 'USD', monto: 1500, medioDePago: 'BILLETERA_VIRTUAL', proyectoId: 103 }
    ])
    httpMock
      .expectOne(`${environment.apiUrl}/freelance/proyectos/103/hitos`)
      .flush('Server error', { status: 500, statusText: 'Error' })

    fixture.detectChanges()
    const comp = fixture.componentInstance

    expect(comp.pagos().length).toBe(1)
    expect(comp.hitos()).toEqual([])
    expect(comp.feedbackError()).toContain('hitos')
    expect(comp.saldoCubierto()).toBe(true)
    comp.seleccionarModoMonto('SALDO')
    expect(comp.montoSeleccionado()).toBeNull()
  })
})
