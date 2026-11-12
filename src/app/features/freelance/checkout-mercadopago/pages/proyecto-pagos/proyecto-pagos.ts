import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { catchError, forkJoin, of } from 'rxjs'
import { gsap } from 'gsap'
import { Auth } from '../../../../../core/auth/services/auth'
import {
  ESTADO_HITO_CONFIG,
  ESTADO_PROYECTO_CONFIG,
  HitoResponseDTO,
  ProyectoResponseDTO,
  formatFechaProyecto
} from '../../../proyecto-gestion/models/proyecto.models'
import { ProyectoAdmin } from '../../../proyecto-gestion/services/proyecto-admin'
import { ProyectoCatalog } from '../../../proyectos-catalogo/services/proyecto-catalog'
import { MpCheckoutButton } from '../../components/mp-button/mp-checkout-button'
import {
  MEDIO_PAGO_CONFIG,
  MedioDePago,
  Moneda,
  PagosResponseDTO,
  formatMontoMoneda,
  formatTotalesPorMoneda
} from '../../models/mercadopago.models'
import { Mercadopago } from '../../services/mercadopago'

export type ModoMontoPago = 'SALDO' | 'HITO' | 'PERSONALIZADO'

@Component({
  imports: [RouterLink, MpCheckoutButton],
  selector: 'app-proyecto-pagos',
  styleUrl: './proyecto-pagos.css',
  templateUrl: './proyecto-pagos.html'
})
export class ProyectoPagos implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private auth = inject(Auth)
  private catalogService = inject(ProyectoCatalog)
  private proyectoAdmin = inject(ProyectoAdmin)
  private mpService = inject(Mercadopago)
  private hostEl = inject(ElementRef<HTMLElement>)

  readonly proyecto = signal<ProyectoResponseDTO | null>(null)
  readonly hitos = signal<HitoResponseDTO[]>([])
  readonly pagos = signal<PagosResponseDTO[]>([])

  readonly isLoading = signal<boolean>(true)
  readonly isRefreshingPagos = signal<boolean>(false)
  readonly isMutatingPago = this.mpService.isMutating
  readonly errorCarga = signal<string | null>(null)
  readonly feedbackOk = signal<string | null>(null)
  readonly feedbackError = signal<string | null>(null)

  // Selector WL-39 y WL-41
  readonly medioSeleccionado = signal<MedioDePago>('BILLETERA_VIRTUAL')
  readonly modoMonto = signal<ModoMontoPago>('SALDO')
  readonly hitoSeleccionadoId = signal<number | null>(null)
  readonly montoPersonalizado = signal<string>('')

  // Modal secundario: Registrar pago directo (POST .../pagos)
  readonly mostrarModalPagoDirecto = signal<boolean>(false)
  readonly modalMoneda = signal<Moneda>('PESOS')
  readonly modalMedio = signal<MedioDePago>('TARJETA')
  readonly modalMonto = signal<string>('')
  readonly modalError = signal<string | null>(null)

  readonly isCliente = computed(() => this.auth.session()?.rol === 'CLIENTE')
  readonly estadoConfig = ESTADO_PROYECTO_CONFIG
  readonly estadoHitoConfig = ESTADO_HITO_CONFIG
  readonly medioPagoConfig = MEDIO_PAGO_CONFIG
  readonly mediosPagoDisponibles: MedioDePago[] = ['BILLETERA_VIRTUAL', 'TARJETA']
  readonly formatFecha = (f?: string) => formatFechaProyecto(f, false)
  readonly formatMonto = formatMontoMoneda

  readonly hitosPendientesPago = computed<HitoResponseDTO[]>(() =>
    this.hitos().filter((h) => h.estado !== 'PAGADO')
  )

  readonly totalPlanificadoHitos = computed<number>(() =>
    this.hitos().reduce((acc, h) => acc + (Number(h.monto) || 0), 0)
  )

  readonly totalAbonado = computed<number>(() =>
    this.pagos().reduce((acc, p) => acc + (Number(p.monto) || 0), 0)
  )

  readonly totalAbonadoTexto = computed<string>(() =>
    formatTotalesPorMoneda(this.pagos())
  )

  readonly montoReferenciaProyecto = computed<number>(() => {
    const totalHitos = this.totalPlanificadoHitos()
    if (totalHitos > 0) return totalHitos
    const p = this.proyecto()
    return Number(p?.presupuestoMax || p?.presupuestoMin || 0)
  })

  readonly saldoRestante = computed<number>(() => {
    const ref = this.montoReferenciaProyecto()
    if (ref <= 0) return 0
    return Math.max(0, ref - this.totalAbonado())
  })

  readonly saldoCubierto = computed<boolean>(
    () => this.montoReferenciaProyecto() > 0 && this.saldoRestante() === 0
  )

  readonly puedeOperarPagos = computed<boolean>(() => {
    const estado = this.proyecto()?.estado
    return this.isCliente() && (estado === 'EN_PROGRESO' || estado === 'FINALIZADO')
  })

  readonly montoSeleccionado = computed<number | null>(() => {
    const modo = this.modoMonto()
    if (modo === 'SALDO') {
      const saldo = this.saldoRestante()
      if (saldo > 0) return saldo
      if (this.montoReferenciaProyecto() > 0) return null
      const fallback = Number(this.proyecto()?.presupuestoMax || this.proyecto()?.presupuestoMin || 0)
      return fallback > 0 ? fallback : null
    }
    if (modo === 'HITO') {
      const id = this.hitoSeleccionadoId()
      const hito = this.hitosPendientesPago().find((h) => h.hitoId === id)
      return hito && hito.monto > 0 ? Number(hito.monto) : null
    }
    const num = Number(this.montoPersonalizado())
    return Number.isFinite(num) && num > 0 ? num : null
  })

  readonly montoValido = computed<boolean>(() => {
    const m = this.montoSeleccionado()
    return m !== null && Number.isFinite(m) && m > 0
  })

  readonly excedePresupuestoModal = computed<boolean>(() => {
    const max = Number(this.proyecto()?.presupuestoMax || 0)
    const monto = Number(this.modalMonto())
    if (max <= 0 || !Number.isFinite(monto) || monto <= 0) return false
    return this.totalAbonado() + monto > max
  })

  private gsapCtx: gsap.Context | null = null

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mostrarModalPagoDirecto() && !this.isMutatingPago()) {
      this.cerrarModalPagoDirecto()
    }
  }

  ngOnInit(): void {
    this.cargarDatos()
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  cargarDatos(): void {
    const idParam = this.route.snapshot.paramMap.get('id')
    if (!idParam) {
      this.errorCarga.set('No se especificó un proyecto válido para gestionar pagos.')
      this.isLoading.set(false)
      return
    }

    this.isLoading.set(true)
    this.errorCarga.set(null)

    this.catalogService.getProyectoById(idParam).subscribe({
      next: (proyecto) => {
        if (!proyecto) {
          this.errorCarga.set('No encontramos el proyecto solicitado.')
          this.isLoading.set(false)
          return
        }
        this.proyecto.set(proyecto)

        let falloPagos = false
        let falloHitos = false

        forkJoin({
          pagos: this.mpService.getPagos(proyecto.proyectoId).pipe(
            catchError(() => {
              falloPagos = true
              return of([] as PagosResponseDTO[])
            })
          ),
          hitos: this.proyectoAdmin.getHitos(proyecto.proyectoId).pipe(
            catchError(() => {
              falloHitos = true
              return of([])
            })
          )
        }).subscribe(({ pagos, hitos }) => {
          this.pagos.set(Array.isArray(pagos) ? pagos : [])
          const listHitos = Array.isArray(hitos) ? hitos : []
          this.hitos.set(listHitos)

          const pendientes = listHitos.filter((h) => h.estado !== 'PAGADO')
          if (pendientes.length > 0) {
            this.hitoSeleccionadoId.set(pendientes[0].hitoId)
          }
          if (this.saldoRestante() <= 0 && pendientes.length === 0) {
            this.modoMonto.set('PERSONALIZADO')
          }

          if (falloPagos && falloHitos) {
            this.feedbackError.set('No pudimos cargar el historial completo de pagos del proyecto.')
          } else if (falloPagos) {
            this.feedbackError.set('No pudimos cargar el historial de pagos registrados.')
          } else if (falloHitos) {
            this.feedbackError.set('No pudimos cargar los hitos del proyecto.')
          }

          this.isLoading.set(false)
          queueMicrotask(() => this.animarEntrada())
        })
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar la información del proyecto.')
        this.isLoading.set(false)
      }
    })
  }

  recargarPagos(): void {
    const p = this.proyecto()
    if (!p || this.isRefreshingPagos()) return
    this.isRefreshingPagos.set(true)
    this.feedbackError.set(null)

    this.mpService.getPagos(p.proyectoId).subscribe({
      next: (pagos) => {
        this.pagos.set(Array.isArray(pagos) ? pagos : [])
        this.isRefreshingPagos.set(false)
      },
      error: () => {
        this.isRefreshingPagos.set(false)
        this.feedbackError.set('No se pudo actualizar el historial de pagos en este momento.')
      }
    })
  }

  seleccionarModoMonto(modo: ModoMontoPago): void {
    this.modoMonto.set(modo)
    this.feedbackError.set(null)
    if (modo === 'HITO' && !this.hitoSeleccionadoId()) {
      const primero = this.hitosPendientesPago()[0]
      if (primero) this.hitoSeleccionadoId.set(primero.hitoId)
    }
  }

  onCheckoutError(msg: string): void {
    this.feedbackOk.set(null)
    this.feedbackError.set(msg)
  }

  abrirModalPagoDirecto(): void {
    this.modalError.set(null)
    this.modalMedio.set(this.medioSeleccionado())
    const sugerido = this.montoSeleccionado()
    this.modalMonto.set(sugerido && sugerido > 0 ? String(sugerido) : '')
    this.mostrarModalPagoDirecto.set(true)
  }

  cerrarModalPagoDirecto(): void {
    if (this.isMutatingPago()) return
    this.mostrarModalPagoDirecto.set(false)
    this.modalError.set(null)
  }

  confirmarPagoDirecto(event: Event): void {
    event.preventDefault()
    const p = this.proyecto()
    if (!p) return

    this.modalError.set(null)
    this.feedbackOk.set(null)
    this.feedbackError.set(null)

    const monto = Number(this.modalMonto())
    if (!Number.isFinite(monto) || monto <= 0) {
      this.modalError.set('Ingresá un monto válido mayor a 0.')
      return
    }

    this.mpService
      .registrarPago(p.proyectoId, {
        moneda: this.modalMoneda(),
        monto,
        medioDePago: this.modalMedio()
      })
      .subscribe({
        next: (nuevo) => {
          this.mostrarModalPagoDirecto.set(false)
          this.pagos.update((curr) => [nuevo, ...curr])
          this.feedbackOk.set(
            `Pago #${nuevo.pagoId} por ${this.formatMonto(nuevo.monto, nuevo.moneda)} registrado correctamente.`
          )
          // Refresca el proyecto e hitos por si el backend actualizó estados tras completar el pago
          this.catalogService.getProyectoById(p.proyectoId).subscribe({
            next: (updated) => updated && this.proyecto.set(updated)
          })
          this.proyectoAdmin.getHitos(p.proyectoId).subscribe({
            next: (hitos) => Array.isArray(hitos) && this.hitos.set(hitos)
          })
        },
        error: (err) => {
          const raw = err?.error?.message
          const safeMsg =
            typeof raw === 'string' && raw.trim().length > 0 && !/Exception|Trace|java\./i.test(raw)
              ? raw
              : 'No se pudo registrar el pago. Verificá que el proyecto esté en progreso y el monto sea válido.'
          this.modalError.set(safeMsg)
        }
      })
  }

  private animarEntrada(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    this.gsapCtx?.revert()
    this.gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.pago-animate', {
          y: 12,
          autoAlpha: 0,
          duration: 0.34,
          stagger: 0.06,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility'
        })
      })
    }, this.hostEl.nativeElement)
  }
}
