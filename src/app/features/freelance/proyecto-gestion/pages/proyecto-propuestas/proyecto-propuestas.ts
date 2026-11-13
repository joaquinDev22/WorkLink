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
import { gsap } from 'gsap'
import { ProyectoCatalog } from '../../../proyectos-catalogo/services/proyecto-catalog'
import { ProyectoAdmin } from '../../services/proyecto-admin'
import {
  ESTADO_PROYECTO_CONFIG,
  PostulacionProyectoResponseDTO,
  ProyectoResponseDTO,
  formatFechaProyecto
} from '../../models/proyecto.models'
import { formatMontoMoneda } from '../../../checkout-mercadopago/models/mercadopago.models'

@Component({
  imports: [RouterLink],
  selector: 'app-proyecto-propuestas',
  styleUrl: './proyecto-propuestas.css',
  templateUrl: './proyecto-propuestas.html'
})
export class ProyectoPropuestas implements OnInit, OnDestroy {
  readonly formatMonto = formatMontoMoneda
  private route = inject(ActivatedRoute)
  private catalogService = inject(ProyectoCatalog)
  private proyectoAdmin = inject(ProyectoAdmin)
  private hostEl = inject(ElementRef<HTMLElement>)

  readonly proyecto = signal<ProyectoResponseDTO | null>(null)
  readonly propuestas = signal<PostulacionProyectoResponseDTO[]>([])
  readonly isLoading = signal<boolean>(true)
  readonly isAssigning = this.proyectoAdmin.isMutating

  readonly orden = signal<'recientes' | 'menor_costo'>('recientes')
  readonly candidaturaAConfirmar = signal<PostulacionProyectoResponseDTO | null>(null)

  readonly feedbackOk = signal<string | null>(null)
  readonly feedbackError = signal<string | null>(null)

  readonly estadoConfig = ESTADO_PROYECTO_CONFIG
  readonly formatFecha = (f?: string) => formatFechaProyecto(f, false)

  readonly propuestasOrdenadas = computed<PostulacionProyectoResponseDTO[]>(() => {
    const list = [...this.propuestas()]
    if (this.orden() === 'menor_costo') {
      return list.sort((a, b) => a.costoPropuesto - b.costoPropuesto)
    }
    return list.sort((a, b) => b.postulacionId - a.postulacionId)
  })

  private gsapCtx: gsap.Context | null = null

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.candidaturaAConfirmar() && !this.isAssigning()) {
      this.candidaturaAConfirmar.set(null)
    }
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id')
    if (!idParam) {
      this.feedbackError.set('Identificador de proyecto inválido.')
      this.isLoading.set(false)
      return
    }

    this.catalogService.getProyectoById(idParam).subscribe({
      next: (p) => {
        this.proyecto.set(p)
        this.catalogService.getPostulaciones(p.proyectoId).subscribe({
          next: (props) => {
            this.propuestas.set(Array.isArray(props) ? props : [])
            this.isLoading.set(false)
            queueMicrotask(() => this.animarLista())
          },
          error: () => {
            this.feedbackError.set('No pudimos cargar las postulaciones de este proyecto.')
            this.isLoading.set(false)
          }
        })
      },
      error: () => {
        this.feedbackError.set('No encontramos el proyecto solicitado.')
        this.isLoading.set(false)
      }
    })
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  private animarLista(): void {
    this.gsapCtx?.revert()
    this.gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.propuesta-card', {
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

  cambiarOrden(val: string): void {
    this.orden.set(val === 'menor_costo' ? 'menor_costo' : 'recientes')
  }

  confirmarAdjudicacion(): void {
    const cand = this.candidaturaAConfirmar()
    const proj = this.proyecto()
    if (!cand || !proj) return

    this.feedbackError.set(null)
    this.proyectoAdmin.asignarProyecto(proj.proyectoId, cand.empleadoId).subscribe({
      next: (actualizado) => {
        this.proyecto.set({
          ...proj,
          ...(actualizado ?? {}),
          estado: 'EN_PROGRESO',
          nombreFreelancer: actualizado?.nombreFreelancer || cand.nombreEmpleado
        })
        this.candidaturaAConfirmar.set(null)
        this.feedbackOk.set(
          `Proyecto adjudicado a ${cand.nombreEmpleado}. Ya puedes definir hitos en Mis Proyectos.`
        )
      },
      error: (err) => {
        this.feedbackError.set(
          err.error?.message || 'No pudimos completar la adjudicación del proyecto.'
        )
      }
    })
  }
}
