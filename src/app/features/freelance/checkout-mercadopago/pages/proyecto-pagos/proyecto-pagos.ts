import {
  Component,
  ElementRef,
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
  labelHito,
  ESTADO_PROYECTO_CONFIG,
  HitoResponseDTO,
  ProyectoResponseDTO,
  formatFechaProyecto
} from '../../../proyecto-gestion/models/proyecto.models'
import { ProyectoAdmin } from '../../../proyecto-gestion/services/proyecto-admin'
import { ProyectoCatalog } from '../../../proyectos-catalogo/services/proyecto-catalog'
import { MpCheckoutButton } from '../../components/mp-button/mp-checkout-button'
import {
  PagosResponseDTO,
  formatMontoMoneda,
  formatTotalesPorMoneda
} from '../../models/mercadopago.models'
import { Mercadopago } from '../../services/mercadopago'

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

  readonly isCliente = computed(() => this.auth.session()?.rol === 'CLIENTE')
  readonly estadoConfig = ESTADO_PROYECTO_CONFIG
  readonly estadoHitoConfig = ESTADO_HITO_CONFIG
  readonly formatFecha = (f?: string) => formatFechaProyecto(f, false)
  readonly formatMonto = formatMontoMoneda
  readonly labelHito = labelHito

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

  // D5: el próximo hito es el primero sin completar; solo se paga si sigue PENDIENTE
  readonly proximoHito = computed(() => this.hitos().find((h) => h.estado !== 'COMPLETADO') ?? null)

  private gsapCtx: gsap.Context | null = null

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

  onCheckoutError(msg: string): void {
    this.feedbackOk.set(null)
    this.feedbackError.set(msg)
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
