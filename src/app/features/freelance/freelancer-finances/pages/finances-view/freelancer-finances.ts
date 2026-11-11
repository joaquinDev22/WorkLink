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
import { RouterLink } from '@angular/router'
import { catchError, forkJoin, of } from 'rxjs'
import { gsap } from 'gsap'
import {
  MEDIO_PAGO_CONFIG,
  MedioDePago,
  formatMontoMoneda
} from '../../../checkout-mercadopago/models/mercadopago.models'
import {
  ESTADO_PROYECTO_CONFIG,
  formatFechaProyecto
} from '../../../proyecto-gestion/models/proyecto.models'
import { ProyectoAdmin } from '../../../proyecto-gestion/services/proyecto-admin'
import { FreelancerTransactionResponseDTO } from '../../models/finances.models'
import { Finances } from '../../services/finances'

@Component({
  imports: [RouterLink],
  selector: 'app-freelancer-finances',
  styleUrl: './freelancer-finances.css',
  templateUrl: './freelancer-finances.html'
})
export class FreelancerFinances implements OnInit, OnDestroy {
  protected financesService = inject(Finances)
  protected proyectoAdmin = inject(ProyectoAdmin)
  private hostEl = inject(ElementRef<HTMLElement>)

  readonly finances = this.financesService.balance
  readonly transactions = this.financesService.transactions
  readonly proyectos = this.proyectoAdmin.misProyectos

  readonly isLoading = signal<boolean>(true)
  readonly errorCarga = signal<string | null>(null)
  readonly transactionsError = signal<string | null>(null)

  // Filtros de tabla (WL-43)
  readonly busqueda = signal<string>('')
  readonly filtroMetodo = signal<'TODOS' | MedioDePago>('TODOS')
  readonly filtroMoneda = signal<'TODAS' | 'PESOS' | 'USD'>('TODAS')

  // Modal informativo WL-40 (pendiente de backend)
  readonly mostrarModalCobros = signal<boolean>(false)

  readonly estadoConfig = ESTADO_PROYECTO_CONFIG
  readonly medioPagoConfig = MEDIO_PAGO_CONFIG
  readonly formatFecha = (f?: string) => formatFechaProyecto(f, false)
  readonly formatMonto = formatMontoMoneda

  readonly finalizados = computed(
    () => this.proyectos().filter((p) => p.estado === 'FINALIZADO').length
  )

  readonly enProgreso = computed(
    () => this.proyectos().filter((p) => p.estado === 'EN_PROGRESO').length
  )

  readonly transaccionesFiltradas = computed<FreelancerTransactionResponseDTO[]>(() => {
    const q = this.busqueda().trim().toLowerCase()
    const met = this.filtroMetodo()
    const mon = this.filtroMoneda()

    return this.transactions().filter((t) => {
      if (met !== 'TODOS' && t.paymentMethod !== met) return false
      if (mon !== 'TODAS' && t.currency?.toUpperCase() !== mon) return false
      if (!q) return true
      return (
        (t.projectTitle || '').toLowerCase().includes(q) ||
        String(t.projectId).includes(q) ||
        String(t.id).includes(q)
      )
    })
  })

  readonly hayFiltrosActivos = computed(
    () =>
      this.busqueda().trim().length > 0 ||
      this.filtroMetodo() !== 'TODOS' ||
      this.filtroMoneda() !== 'TODAS'
  )

  private gsapCtx: gsap.Context | null = null

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mostrarModalCobros()) {
      this.mostrarModalCobros.set(false)
    }
  }

  ngOnInit(): void {
    this.cargarFinanzas()
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  cargarFinanzas(): void {
    this.isLoading.set(true)
    this.errorCarga.set(null)
    this.transactionsError.set(null)

    let falloFinanzas = false
    let falloTransactions = false

    forkJoin({
      finances: this.financesService.getFinances().pipe(
        catchError(() => {
          falloFinanzas = true
          return of(null)
        })
      ),
      transactions: this.financesService.getTransactions().pipe(
        catchError(() => {
          falloTransactions = true
          return of([])
        })
      ),
      proyectos: this.proyectoAdmin.getMisProyectosAsignados().pipe(catchError(() => of([])))
    }).subscribe(({ finances, transactions }) => {
      if (falloFinanzas && falloTransactions && !finances && transactions.length === 0) {
        this.errorCarga.set('No pudimos cargar tu resumen financiero. Intentá nuevamente.')
      } else if (falloTransactions) {
        this.transactionsError.set('No pudimos cargar el historial de transacciones en este momento.')
      }
      this.isLoading.set(false)
      queueMicrotask(() => this.animarEntrada())
    })
  }

  limpiarFiltros(): void {
    this.busqueda.set('')
    this.filtroMetodo.set('TODOS')
    this.filtroMoneda.set('TODAS')
  }

  labelMetodo(method: string): string {
    if (method === 'BILLETERA_VIRTUAL' || method === 'TARJETA') {
      return this.medioPagoConfig[method].label
    }
    return method
  }

  badgeMetodo(method: string): string {
    if (method === 'BILLETERA_VIRTUAL' || method === 'TARJETA') {
      return this.medioPagoConfig[method].badgeClass
    }
    return 'bg-slate-100 text-slate-700 border border-slate-200'
  }

  private animarEntrada(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    this.gsapCtx?.revert()
    this.gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.fin-kpi', {
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
