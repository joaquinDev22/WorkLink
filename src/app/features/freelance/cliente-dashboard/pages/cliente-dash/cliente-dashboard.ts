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
import { FormField, form, maxLength, minLength, required } from '@angular/forms/signals'
import { gsap } from 'gsap'
import { Cliente } from '../../services/cliente'
import { ProyectoAdmin } from '../../../proyecto-gestion/services/proyecto-admin'
import {
  ESTADO_PROYECTO_CONFIG,
  formatFechaProyecto
} from '../../../proyecto-gestion/models/proyecto.models'
import { ClientProfileRequestDTO } from '../../models/cliente-dashboard.models'

@Component({
  imports: [RouterLink, FormField],
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
  readonly isSavingPerfil = this.clienteService.isMutating

  readonly proyectosRecientes = computed(() => this.proyectoAdmin.misProyectos().slice(0, 4))
  readonly isLoadingProyectos = this.proyectoAdmin.isLoading

  readonly perfilCargado = signal<boolean>(false)
  readonly toastMensaje = signal<string | null>(null)
  readonly toastError = signal<string | null>(null)

  readonly estadoConfig = ESTADO_PROYECTO_CONFIG
  readonly formatFecha = (f?: string) => formatFechaProyecto(f, false)

  readonly perfilModel = signal<ClientProfileRequestDTO>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
    fechaNacimiento: ''
  })

  readonly perfilForm = form(this.perfilModel, (f) => {
    required(f.firstName, { message: 'El nombre es obligatorio' })
    minLength(f.firstName, 2, { message: 'Mínimo 2 caracteres' })
    maxLength(f.firstName, 50, { message: 'Máximo 50 caracteres' })

    required(f.lastName, { message: 'El apellido es obligatorio' })
    minLength(f.lastName, 2, { message: 'Mínimo 2 caracteres' })
    maxLength(f.lastName, 50, { message: 'Máximo 50 caracteres' })

    required(f.phoneNumber, { message: 'El teléfono de contacto es obligatorio' })
    required(f.country, { message: 'El país es obligatorio' })
    required(f.fechaNacimiento, { message: 'La fecha de nacimiento es obligatoria' })
  })

  private gsapCtx: gsap.Context | null = null

  ngOnInit(): void {
    this.clienteService.getDashboard().subscribe({
      next: () => queueMicrotask(() => this.animarEntrada()),
      error: () => this.toastError.set('No se pudieron cargar las métricas del cliente.')
    })

    this.clienteService.getMiPerfilCliente().subscribe({
      next: (p) => {
        if (p) {
          this.perfilModel.set({
            firstName: p.firstName ?? '',
            lastName: p.lastName ?? '',
            phoneNumber: p.phoneNumber ?? '',
            country: p.country ?? '',
            fechaNacimiento: p.fechaNacimiento ?? ''
          })
        }
        this.perfilCargado.set(true)
      },
      error: () => {
        this.perfilCargado.set(true)
      }
    })

    this.proyectoAdmin.getMisProyectosPublicados().subscribe({
      error: () => {
        // Error manejado silenciosamente para no bloquear métricas ni perfil
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

  guardarPerfil(event: Event): void {
    event.preventDefault()
    this.toastError.set(null)
    this.toastMensaje.set(null)

    if (this.perfilForm().invalid()) {
      this.toastError.set('Revisa los campos obligatorios del perfil antes de guardar.')
      return
    }

    this.clienteService.actualizarPerfilCliente(this.perfilModel()).subscribe({
      next: () => {
        this.toastMensaje.set('Perfil de cliente actualizado correctamente.')
        setTimeout(() => this.toastMensaje.set(null), 4000)
      },
      error: (err) => {
        this.toastError.set(
          err.error?.message || 'No pudimos actualizar tu perfil. Verifica los datos ingresados.'
        )
      }
    })
  }
}
