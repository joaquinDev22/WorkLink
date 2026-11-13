import {
  Component,
  ElementRef,
  HostListener,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  computed,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { gsap } from 'gsap'
import { formatMontoMoneda } from '../../../checkout-mercadopago/models/mercadopago.models'
import { ProyectoAdmin } from '../../services/proyecto-admin'
import { ProyectoCatalog } from '../../../proyectos-catalogo/services/proyecto-catalog'
import {
  CalificacionProyectoResponseDTO,
  ESTADO_HITO_CONFIG,
  labelHito,
  ESTADO_PROYECTO_CONFIG,
  EstadoHito,
  HitoResponseDTO,
  ProyectoResponseDTO,
  formatFechaProyecto
} from '../../models/proyecto.models'

@Component({
  imports: [RouterLink],
  selector: 'app-proyecto-workspace-panel',
  styleUrl: './proyecto-workspace-panel.css',
  templateUrl: './proyecto-workspace-panel.html'
})
export class ProyectoWorkspacePanel implements OnChanges, OnDestroy {
  private proyectoAdmin = inject(ProyectoAdmin)
  private catalogService = inject(ProyectoCatalog)
  private hostEl = inject(ElementRef<HTMLElement>)

  readonly role = input.required<'CLIENTE' | 'FREELANCER'>()
  readonly proyecto = model.required<ProyectoResponseDTO>()
  readonly proyectoCancelado = output<number>()

  readonly hitos = signal<HitoResponseDTO[]>([])
  readonly calificaciones = signal<CalificacionProyectoResponseDTO[]>([])
  readonly isLoadingHitos = signal<boolean>(true)
  readonly isMutating = signal<boolean>(false)

  // Crear hito (solo cliente en EN_PROGRESO)
  readonly mostrarFormHito = signal<boolean>(false)
  readonly hitoTitulo = signal<string>('')
  readonly hitoDesc = signal<string>('')
  readonly hitoFechaLimite = signal<string>('')

  // Cancelación irreversible (WL-36)
  readonly mostrarModalCancelar = signal<boolean>(false)

  // Calificación 1..5 estrellas (WL-37)
  readonly puntajeSeleccionado = signal<number>(5)
  readonly puntajeHover = signal<number>(0)
  readonly comentarioResena = signal<string>('')
  readonly resenaEnviada = signal<CalificacionProyectoResponseDTO | null>(null)

  readonly feedbackOk = signal<string | null>(null)
  readonly feedbackError = signal<string | null>(null)

  readonly estadoProyectoConfig = ESTADO_PROYECTO_CONFIG
  readonly estadoHitoConfig = ESTADO_HITO_CONFIG
  readonly labelHito = labelHito
  readonly formatMonto = (monto: number) => formatMontoMoneda(monto, 'PESOS')
  readonly formatFecha = (f?: string) => formatFechaProyecto(f, false)

  // El próximo hito a pagar: el primero sin completar, siempre que siga PENDIENTE (los hitos van en orden)
  readonly proximoHitoId = computed(() => {
    const siguiente = this.hitos().find((h) => h.estado !== 'COMPLETADO')
    return siguiente?.estado === 'PENDIENTE' ? siguiente.hitoId : null
  })

  readonly esSoloLectura = computed(() => {
    const e = this.proyecto().estado
    return e === 'FINALIZADO' || e === 'CANCELADO'
  })

  readonly totalPresupuestoHitos = computed(() =>
    this.hitos().reduce((acc, h) => acc + (h.monto || 0), 0)
  )

  readonly totalPagadoHitos = computed(() =>
    this.hitos()
      .filter((h) => h.estado !== 'PENDIENTE')
      .reduce((acc, h) => acc + (h.monto || 0), 0)
  )

  readonly porcentajeAvance = computed(() => {
    const list = this.hitos()
    if (list.length === 0) return 0
    const puntos = list.reduce((acc, h) => {
      if (h.estado === 'COMPLETADO') return acc + 1
      if (h.estado === 'EN_PROGRESO') return acc + 0.5
      return acc
    }, 0)
    return Math.round((puntos / list.length) * 100)
  })

  private gsapCtx: gsap.Context | null = null

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mostrarModalCancelar() && !this.isMutating()) {
      this.mostrarModalCancelar.set(false)
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['proyecto']) {
      this.cargarDatosWorkspace()
    }
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  private cargarDatosWorkspace(): void {
    const p = this.proyecto()
    this.feedbackOk.set(null)
    this.feedbackError.set(null)
    this.mostrarFormHito.set(false)
    this.resenaEnviada.set(null)
    this.isLoadingHitos.set(true)

    this.proyectoAdmin.getHitos(p.proyectoId).subscribe({
      next: (data) => {
        this.hitos.set(Array.isArray(data) ? data : [])
        this.isLoadingHitos.set(false)
        queueMicrotask(() => this.animarHitos())
      },
      error: () => {
        this.hitos.set([])
        this.isLoadingHitos.set(false)
      }
    })

    if (p.estado === 'FINALIZADO') {
      this.catalogService.getCalificaciones(p.proyectoId).subscribe({
        next: (revs) => {
          const list = Array.isArray(revs) ? revs : []
          this.calificaciones.set(list)
          this.resenaEnviada.set(list[0] ?? null)
        },
        error: () => this.calificaciones.set([])
      })
    } else {
      this.calificaciones.set([])
    }
  }

  private animarHitos(): void {
    this.gsapCtx?.revert()
    this.gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.hito-row', {
          y: 10,
          autoAlpha: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: 'power2.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility'
        })
      })
    }, this.hostEl.nativeElement)
  }

  crearHito(event: Event): void {
    event.preventDefault()
    this.feedbackError.set(null)
    this.feedbackOk.set(null)

    const titulo = this.hitoTitulo().trim()
    if (!titulo) {
      this.feedbackError.set('Ingresa un título para el hito.')
      return
    }

    this.isMutating.set(true)
    this.proyectoAdmin
      .crearHito(this.proyecto().proyectoId, {
        titulo,
        descripcion: this.hitoDesc().trim(),
        fechaLimite: this.hitoFechaLimite() || undefined
      })
      .subscribe({
        next: (nuevo) => {
          // El backend vuelve a repartir el monto acordado entre los hitos pendientes: se recarga la lista
          this.cargarDatosWorkspace()
          this.hitoTitulo.set('')
          this.hitoDesc.set('')
          this.hitoFechaLimite.set('')
          this.mostrarFormHito.set(false)
          this.isMutating.set(false)
          this.feedbackOk.set(`Hito "${nuevo.titulo}" agregado al plan de entregas.`)
        },
        error: (err) => {
          this.isMutating.set(false)
          this.feedbackError.set(err.error?.message || 'No se pudo crear el hito.')
        }
      })
  }

  cambiarEstadoHito(hito: HitoResponseDTO, nuevoEstado: EstadoHito): void {
    this.feedbackError.set(null)
    this.feedbackOk.set(null)
    this.isMutating.set(true)

    this.proyectoAdmin
      .actualizarEstadoHito(this.proyecto().proyectoId, hito.hitoId, nuevoEstado)
      .subscribe({
        next: () => {
          this.hitos.update((list) =>
            list.map((h) => (h.hitoId === hito.hitoId ? { ...h, estado: nuevoEstado } : h))
          )
          this.isMutating.set(false)
          this.feedbackOk.set(
            `Hito "${hito.titulo}" marcado como completado. El cliente ya puede pagar el siguiente.`
          )
        },
        error: (err) => {
          this.isMutating.set(false)
          this.feedbackError.set(
            err.error?.message || 'No fue posible actualizar el estado del hito.'
          )
        }
      })
  }

  confirmarCancelacion(): void {
    this.feedbackError.set(null)
    this.isMutating.set(true)
    const id = this.proyecto().proyectoId

    this.proyectoAdmin.cancelarProyecto(id).subscribe({
      next: () => {
        this.isMutating.set(false)
        this.mostrarModalCancelar.set(false)
        this.proyecto.update((curr) => ({ ...curr, estado: 'CANCELADO' }))
        this.proyectoCancelado.emit(id)
        this.feedbackOk.set('El proyecto fue cancelado. El panel quedó en modo solo lectura.')
      },
      error: (err) => {
        this.isMutating.set(false)
        this.feedbackError.set(err.error?.message || 'No se pudo cancelar el proyecto.')
      }
    })
  }

  enviarCalificacion(event: Event): void {
    event.preventDefault()
    this.feedbackError.set(null)
    const comentario = this.comentarioResena().trim()
    const puntaje = this.puntajeSeleccionado()

    if (puntaje < 1 || puntaje > 5) {
      this.feedbackError.set('Selecciona una puntuación entre 1 y 5 estrellas.')
      return
    }
    if (comentario.length < 5) {
      this.feedbackError.set('Escribe un breve comentario sobre la experiencia de trabajo.')
      return
    }

    this.isMutating.set(true)
    this.catalogService
      .calificarProyecto(this.proyecto().proyectoId, { puntaje, comentario })
      .subscribe({
        next: (res) => {
          this.isMutating.set(false)
          this.resenaEnviada.set(res)
          this.calificaciones.update((curr) => [res, ...curr])
          this.comentarioResena.set('')
          this.feedbackOk.set('¡Gracias! Tu valoración quedó registrada en el proyecto.')
        },
        error: (err) => {
          this.isMutating.set(false)
          this.feedbackError.set(
            err.error?.message || 'No se pudo registrar la calificación. Intenta nuevamente.'
          )
        }
      })
  }
}
