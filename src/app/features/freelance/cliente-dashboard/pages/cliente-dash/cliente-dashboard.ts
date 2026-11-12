import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { gsap } from 'gsap'
import { Cliente } from '../../services/cliente'
import { ProyectoAdmin } from '../../../proyecto-gestion/services/proyecto-admin'
import {
  ESTADO_PROYECTO_CONFIG,
  formatFechaProyecto
} from '../../../proyecto-gestion/models/proyecto.models'

@Component({
  imports: [RouterLink],
  selector: 'app-cliente-dashboard',
  styleUrl: './cliente-dashboard.css',
  templateUrl: './cliente-dashboard.html'
})
export class ClienteDashboard implements OnInit, OnDestroy {
  protected clienteService = inject(Cliente)
  protected proyectoAdmin = inject(ProyectoAdmin)
  private hostEl = inject(ElementRef<HTMLElement>)

  readonly stats = this.clienteService.stats
  readonly perfil = this.clienteService.perfil
  readonly isLoadingStats = this.clienteService.isLoading

  readonly proyectosRecientes = computed(() => this.proyectoAdmin.misProyectos().slice(0, 4))
  readonly isLoadingProyectos = this.proyectoAdmin.isLoading

  readonly toastMensaje = signal<string | null>(null)
  readonly toastError = signal<string | null>(null)

  readonly estadoConfig = ESTADO_PROYECTO_CONFIG
  readonly formatFecha = (f?: string) => formatFechaProyecto(f, false)

  private gsapCtx: gsap.Context | null = null

  ngOnInit(): void {
    this.clienteService.getDashboard().subscribe({
      next: () => queueMicrotask(() => this.animarEntrada()),
      error: () => this.toastError.set('No se pudieron cargar las métricas del cliente.')
    })

    if (!this.perfil()) {
      this.clienteService.getMiPerfilCliente().subscribe({
        error: () => {
          // Opcional en saludo del panel
        }
      })
    }

    this.proyectoAdmin.getMisProyectosPublicados().subscribe({
      error: () => {
        // Error manejado silenciosamente para no bloquear métricas
      }
    })
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  private animarEntrada(): void {
    this.gsapCtx?.revert()
    this.gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.dash-kpi', {
          y: 14,
          autoAlpha: 0,
          duration: 0.36,
          stagger: 0.06,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility'
        })
      })
    }, this.hostEl.nativeElement)
  }
}
