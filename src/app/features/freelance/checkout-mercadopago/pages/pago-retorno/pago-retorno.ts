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
import { forkJoin } from 'rxjs'
import { gsap } from 'gsap'
import { Auth } from '../../../../../core/auth/services/auth'
import { ProyectoResponseDTO } from '../../../proyecto-gestion/models/proyecto.models'
import { ProyectoCatalog } from '../../../proyectos-catalogo/services/proyecto-catalog'
import {
  MEDIO_PAGO_CONFIG,
  PagosResponseDTO,
  formatMontoMoneda,
  formatTotalesPorMoneda
} from '../../models/mercadopago.models'
import { Mercadopago } from '../../services/mercadopago'

export type EstadoRetornoMP = 'success' | 'failure' | 'pending'

@Component({
  imports: [RouterLink],
  selector: 'app-pago-retorno',
  styleUrl: './pago-retorno.css',
  templateUrl: './pago-retorno.html'
})
export class PagoRetorno implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private auth = inject(Auth)
  private mpService = inject(Mercadopago)
  private catalogService = inject(ProyectoCatalog)
  private hostEl = inject(ElementRef<HTMLElement>)

  readonly estadoRetorno = signal<EstadoRetornoMP>('success')
  readonly paymentId = signal<string | null>(null)
  readonly mpStatus = signal<string | null>(null)
  readonly externalReference = signal<string | null>(null)
  readonly preferenceId = signal<string | null>(null)
  readonly proyectoId = signal<number | null>(null)

  readonly proyecto = signal<ProyectoResponseDTO | null>(null)
  readonly pagosConfirmados = signal<PagosResponseDTO[]>([])
  readonly isRevalidating = signal<boolean>(false)
  readonly revalidationError = signal<string | null>(null)

  readonly isCliente = computed(() => this.auth.session()?.rol === 'CLIENTE')
  readonly medioPagoConfig = MEDIO_PAGO_CONFIG
  readonly formatMonto = formatMontoMoneda

  readonly totalConfirmado = computed<number>(() =>
    this.pagosConfirmados().reduce((acc, p) => acc + (Number(p.monto) || 0), 0)
  )

  readonly totalConfirmadoTexto = computed<string>(() =>
    formatTotalesPorMoneda(this.pagosConfirmados())
  )

  private gsapCtx: gsap.Context | null = null

  ngOnInit(): void {
    const dataEstado = this.route.snapshot.data?.['estadoRetorno'] as EstadoRetornoMP | undefined
    if (dataEstado === 'success' || dataEstado === 'failure' || dataEstado === 'pending') {
      this.estadoRetorno.set(dataEstado)
    }

    const qp = this.route.snapshot.queryParamMap
    const pid = qp.get('payment_id') || qp.get('collection_id')
    const st = qp.get('status') || qp.get('collection_status')
    const ext = qp.get('external_reference')
    const pref = qp.get('preference_id')

    this.paymentId.set(pid && pid !== 'null' ? pid : null)
    this.mpStatus.set(st && st !== 'null' ? st : null)
    this.externalReference.set(ext && ext !== 'null' ? ext : null)
    this.preferenceId.set(pref && pref !== 'null' ? pref : null)

    const parsedId = this.extraerProyectoId(ext)
    this.proyectoId.set(parsedId)

    if (parsedId) {
      this.revalidarEstado(parsedId)
    }

    queueMicrotask(() => this.animarEntrada())
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  extraerProyectoId(rawRef: string | null): number | null {
    if (!rawRef) return null
    const clean = rawRef.trim()
    if (/^\d+$/.test(clean)) return Number(clean)
    const match = clean.match(/(\d+)$/)
    return match ? Number(match[1]) : null
  }

  revalidarEstado(idOverride?: number): void {
    const id = idOverride ?? this.proyectoId()
    if (!id || this.isRevalidating()) return

    this.isRevalidating.set(true)
    this.revalidationError.set(null)

    forkJoin({
      pagos: this.mpService.getPagos(id),
      proyecto: this.catalogService.getProyectoById(id)
    }).subscribe({
      next: ({ pagos, proyecto }) => {
        this.pagosConfirmados.set(Array.isArray(pagos) ? pagos : [])
        if (proyecto) this.proyecto.set(proyecto)
        this.isRevalidating.set(false)
      },
      error: () => {
        this.isRevalidating.set(false)
        this.revalidationError.set(
          'No pudimos revalidar los pagos contra el servidor en este momento.'
        )
      }
    })
  }

  private animarEntrada(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    this.gsapCtx?.revert()
    this.gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.retorno-card', {
          y: 16,
          autoAlpha: 0,
          duration: 0.4,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility'
        })
      })
    }, this.hostEl.nativeElement)
  }
}
