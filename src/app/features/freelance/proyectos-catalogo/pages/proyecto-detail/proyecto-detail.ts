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
import { gsap } from 'gsap'
import { Auth } from '../../../../../core/auth/services/auth'
import { ProyectoCatalog } from '../../services/proyecto-catalog'
import {
  CalificacionProyectoResponseDTO,
  ESTADO_PROYECTO_CONFIG,
  PostulacionProyectoResponseDTO,
  ProyectoResponseDTO,
  formatFechaProyecto
} from '../../../proyecto-gestion/models/proyecto.models'
import { PropuestaModal } from '../../components/propuesta-modal/propuesta-modal'

@Component({
  imports: [RouterLink, PropuestaModal],
  selector: 'app-proyecto-detail',
  styleUrl: './proyecto-detail.css',
  templateUrl: './proyecto-detail.html'
})
export class ProyectoDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private catalogService = inject(ProyectoCatalog)
  private auth = inject(Auth)
  private hostEl = inject(ElementRef<HTMLElement>)

  readonly proyecto = signal<ProyectoResponseDTO | null>(null)
  readonly calificaciones = signal<CalificacionProyectoResponseDTO[]>([])
  readonly isLoading = signal<boolean>(true)
  readonly error = signal<string | null>(null)

  readonly mostrarModalPropuesta = signal<boolean>(false)
  readonly propuestaRecienEnviada = signal<PostulacionProyectoResponseDTO | null>(null)

  readonly isCliente = computed(() => this.auth.session()?.rol === 'CLIENTE')
  readonly isFreelancer = computed(() => this.auth.session()?.rol === 'FREELANCER')

  readonly estadoConfig = ESTADO_PROYECTO_CONFIG
  readonly formatFecha = (f?: string) => formatFechaProyecto(f, true)

  private gsapCtx: gsap.Context | null = null

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id')
    if (!idParam) {
      this.error.set('No se especificó un identificador de proyecto válido.')
      this.isLoading.set(false)
      return
    }

    this.catalogService.getProyectoById(idParam).subscribe({
      next: (data) => {
        if (!data) {
          this.error.set('El proyecto solicitado no fue encontrado.')
          this.isLoading.set(false)
          return
        }
        this.proyecto.set(data)
        this.isLoading.set(false)
        this.cargarCalificaciones(data.proyectoId)
        queueMicrotask(() => this.animarEntrada())
      },
      error: () => {
        this.error.set('No pudimos cargar el detalle de este proyecto o ya no está disponible.')
        this.isLoading.set(false)
      }
    })
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  private cargarCalificaciones(proyectoId: number): void {
    this.catalogService.getCalificaciones(proyectoId).subscribe({
      next: (reviews) => this.calificaciones.set(Array.isArray(reviews) ? reviews : []),
      error: () => this.calificaciones.set([])
    })
  }

  private animarEntrada(): void {
    this.gsapCtx?.revert()
    this.gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.detail-animate', {
          y: 14,
          autoAlpha: 0,
          duration: 0.36,
          stagger: 0.07,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility'
        })
      })
    }, this.hostEl.nativeElement)
  }

  onPropuestaEnviada(res: PostulacionProyectoResponseDTO): void {
    this.propuestaRecienEnviada.set(res)
  }
}
