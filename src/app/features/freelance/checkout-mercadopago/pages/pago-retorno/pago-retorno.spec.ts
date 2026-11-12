import { afterEach, describe, expect, it } from 'vitest'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { environment } from '../../../../../../environments/environment'
import { PagoRetorno } from './pago-retorno'

describe('PagoRetorno', () => {
  let httpMock: HttpTestingController

  function setup(dataEstado: 'success' | 'failure' | 'pending', queryParams: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [PagoRetorno],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { estadoRetorno: dataEstado },
              queryParamMap: convertToParamMap(queryParams)
            }
          }
        }
      ]
    })
    httpMock = TestBed.inject(HttpTestingController)
    const fixture = TestBed.createComponent(PagoRetorno)
    fixture.detectChanges()
    return fixture
  }

  afterEach(() => {
    httpMock.verify()
  })

  it('parses numeric and prefixed external_reference and revalidates pagos against backend', () => {
    const fixture = setup('success', {
      payment_id: '987654',
      status: 'approved',
      external_reference: 'WL-PROY-103'
    })
    const comp = fixture.componentInstance

    expect(comp.estadoRetorno()).toBe('success')
    expect(comp.proyectoId()).toBe(103)
    expect(comp.extraerProyectoId('45')).toBe(45)
    expect(comp.extraerProyectoId('12-34')).toBe(12)
    expect(comp.extraerProyectoId(null)).toBeNull()

    const reqPagos = httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/103/pagos`)
    const reqProy = httpMock.expectOne(`${environment.apiUrl}/freelance/proyectos/103`)

    reqPagos.flush([
      { pagoId: 88, moneda: 'PESOS', monto: 50000, medioDePago: 'BILLETERA_VIRTUAL', proyectoId: 103 }
    ])
    reqProy.flush({
      proyectoId: 103,
      uuid: 'abc',
      nombreProyecto: 'API Pagos',
      area: 'Backend',
      descripcion: 'Desc',
      fechaPublicacion: '2026-11-01',
      presupuestoMin: 500,
      presupuestoMax: 1000,
      clienteId: 1,
      nombreCliente: 'Cliente',
      habilidades: [],
      estado: 'EN_PROGRESO'
    })

    fixture.detectChanges()
    expect(comp.pagosConfirmados().length).toBe(1)
    expect(comp.totalConfirmado()).toBe(50000)
    expect(comp.totalConfirmadoTexto()).toBe('$ 50.000')
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('$ 50.000')
    expect(comp.isRevalidating()).toBe(false)
  })

  it('handles failure return without external_reference gracefully', () => {
    const fixture = setup('failure', { status: 'rejected' })
    const comp = fixture.componentInstance

    expect(comp.estadoRetorno()).toBe('failure')
    expect(comp.proyectoId()).toBeNull()
    expect(comp.pagosConfirmados()).toEqual([])
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('El pago no pudo completarse')
  })
})
