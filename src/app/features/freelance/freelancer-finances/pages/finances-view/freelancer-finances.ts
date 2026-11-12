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
import {
  FreelancerTransactionResponseDTO,
  MedioCobroRequestDTO,
  TipoMedioCobro
} from '../../models/finances.models'
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
  readonly medioCobro = this.financesService.medioCobro
  readonly proyectos = this.proyectoAdmin.misProyectos

  readonly isLoading = signal<boolean>(true)
  readonly errorCarga = signal<string | null>(null)
  readonly transactionsError = signal<string | null>(null)

  // Filtros de tabla (WL-43)
  readonly busqueda = signal<string>('')
  readonly filtroMetodo = signal<'TODOS' | MedioDePago>('TODOS')
  readonly filtroMoneda = signal<'TODAS' | 'PESOS' | 'USD'>('TODAS')

  // Modal y formulario WL-40 (Datos de cobro del freelancer)
  readonly mostrarModalCobros = signal<boolean>(false)
  readonly cobroTipo = signal<TipoMedioCobro>('TRANSFERENCIA')
  readonly cobroTitular = signal<string>('')
  readonly cobroDocumento = signal<string>('')
  readonly cobroCbuCvu = signal<string>('')
  readonly cobroAlias = signal<string>('')
  readonly cobroMpEmail = signal<string>('')
  readonly isSavingCobro = signal<boolean>(false)
  readonly isDeletingCobro = signal<boolean>(false)
  readonly cobroError = signal<string | null>(null)
  readonly cobroNotice = signal<string | null>(null)

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
      medioCobro: this.financesService.getMedioCobro().pipe(catchError(() => of(null))),
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

  abrirModalCobros(): void {
    const actual = this.medioCobro()
    this.cobroTipo.set(actual?.tipo ?? 'TRANSFERENCIA')
    this.cobroTitular.set(actual?.titular ?? '')
    this.cobroDocumento.set(actual?.documentoTitular ?? '')
    this.cobroCbuCvu.set(actual?.cbuCvu ?? '')
    this.cobroAlias.set(actual?.alias ?? '')
    this.cobroMpEmail.set(actual?.mercadoPagoEmail ?? '')
    this.cobroError.set(null)
    this.mostrarModalCobros.set(true)
  }

  cerrarModalCobros(): void {
    if (this.isSavingCobro() || this.isDeletingCobro()) return
    this.cobroError.set(null)
    this.mostrarModalCobros.set(false)
  }

  guardarMedioCobro(event: Event): void {
    event.preventDefault()
    const tipo = this.cobroTipo()
    const titular = this.cobroTitular().trim()
    const documentoTitular = this.cobroDocumento().trim()
    const cbuCvu = this.cobroCbuCvu().trim()
    const alias = this.cobroAlias().trim()
    const mercadoPagoEmail = this.cobroMpEmail().trim()

    if (!titular) {
      this.cobroError.set('El nombre del titular es obligatorio.')
      return
    }
    if (titular.length > 120) {
      this.cobroError.set('El titular no puede superar los 120 caracteres.')
      return
    }
    if (documentoTitular && !/^[0-9]{7,11}$/.test(documentoTitular)) {
      this.cobroError.set('El DNI / CUIT / CUIL debe tener entre 7 y 11 dígitos.')
      return
    }
    if (cbuCvu && !/^\d{22}$/.test(cbuCvu)) {
      this.cobroError.set('El CBU / CVU debe tener exactamente 22 dígitos numéricos.')
      return
    }
    if (alias.length > 40) {
      this.cobroError.set('El alias no puede superar los 40 caracteres.')
      return
    }
    if (mercadoPagoEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mercadoPagoEmail)) {
      this.cobroError.set('Ingresá un correo de MercadoPago válido.')
      return
    }
    if (tipo === 'TRANSFERENCIA' && !cbuCvu && !alias) {
      this.cobroError.set('Para transferencia bancaria ingresá al menos tu CBU/CVU o Alias.')
      return
    }
    if (tipo === 'MERCADOPAGO' && !mercadoPagoEmail && !cbuCvu && !alias) {
      this.cobroError.set('Para MercadoPago ingresá el email de tu cuenta, CVU o Alias.')
      return
    }

    const dto: MedioCobroRequestDTO = {
      tipo,
      titular,
      documentoTitular: documentoTitular || null,
      cbuCvu: cbuCvu || null,
      alias: alias || null,
      mercadoPagoEmail: mercadoPagoEmail || null
    }

    this.cobroError.set(null)
    this.isSavingCobro.set(true)
    this.financesService.saveMedioCobro(dto).subscribe({
      next: () => {
        this.isSavingCobro.set(false)
        this.mostrarModalCobros.set(false)
        this.cobroNotice.set('Datos de cobro guardados correctamente.')
      },
      error: (err) => {
        this.isSavingCobro.set(false)
        this.cobroError.set(
          err?.error?.message || 'No pudimos guardar tus datos de cobro. Verificá los campos.'
        )
      }
    })
  }

  eliminarMedioCobro(): void {
    if (this.isSavingCobro() || this.isDeletingCobro()) return
    this.cobroError.set(null)
    this.isDeletingCobro.set(true)
    this.financesService.deleteMedioCobro().subscribe({
      next: () => {
        this.isDeletingCobro.set(false)
        this.mostrarModalCobros.set(false)
        this.cobroNotice.set('Datos de cobro eliminados.')
      },
      error: (err) => {
        this.isDeletingCobro.set(false)
        this.cobroError.set(
          err?.error?.message || 'No pudimos eliminar tus datos de cobro. Intentá nuevamente.'
        )
      }
    })
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
