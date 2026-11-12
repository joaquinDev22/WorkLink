import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef, signal, NgZone } from '@angular/core'
import { Auth } from '../../../../core/auth/services/auth'
import { environment } from '../../../../../environments/environment'
import { UserRole } from '../../../../core/models/user-role'

declare const google: any

export interface OpcionRolGoogle {
  rol: UserRole
  titulo: string
  desc: string
}

@Component({
  selector: 'app-google-button',
  imports: [],
  styleUrl: './google-button.css',
  templateUrl: './google-button.html',
})
export class GoogleButton implements OnInit, AfterViewInit {
  private auth = inject(Auth)
  private ngZone = inject(NgZone)

  @ViewChild('googleBtn') googleBtnRef?: ElementRef<HTMLDivElement>
  isGoogleReady = signal<boolean>(false)

  // Selector de Rol para Google Login
  isRoleModalOpen = signal<boolean>(false)
  pendingGoogleToken = signal<string | null>(null)
  isSubmitting = signal<boolean>(false)
  errorGoogle = signal<string | null>(null)

  readonly opcionesRoles: OpcionRolGoogle[] = [
    {
      rol: 'POSTULANTE',
      titulo: 'Postulante',
      desc: 'Buscar ofertas laborales y postularme a vacantes de empresas.',
    },
    {
      rol: 'FREELANCER',
      titulo: 'Freelancer',
      desc: 'Ofrecer mis servicios profesionales y proyectos independientes.',
    },
    {
      rol: 'EMPRESA',
      titulo: 'Empresa',
      desc: 'Publicar ofertas de empleo y gestionar mi equipo de selección.',
    },
    {
      rol: 'CLIENTE',
      titulo: 'Cliente Particular',
      desc: 'Contratar profesionales independientes para proyectos específicos.',
    }
  ]

  ngOnInit(): void {
    this.esperarGoogle()
  }

  ngAfterViewInit(): void {
    if (this.isGoogleReady()) {
      this.renderizarBoton()
    }
  }

  private esperarGoogle(): void {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      this.configurarGoogle()
    } else {
      const interval = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts?.id) {
          clearInterval(interval)
          this.configurarGoogle()
        }
      }, 60)
      setTimeout(() => clearInterval(interval), 5000)
    }
  }

  private static initialized = false

  private configurarGoogle(): void {
    if (typeof google === 'undefined' || !google.accounts?.id) return
    if (!environment.googleClientId) return

    if (!GoogleButton.initialized) {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (respuesta: any) => {
          this.ngZone.run(() => {
            this.alCompletarGoogleLogin(respuesta)
          })
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true
      })
      GoogleButton.initialized = true
    }

    this.isGoogleReady.set(true)
    setTimeout(() => this.renderizarBoton(), 0)
  }

  private renderizarBoton(): void {
    if (!this.googleBtnRef?.nativeElement || typeof google === 'undefined' || !google.accounts?.id) return

    this.googleBtnRef.nativeElement.innerHTML = ''

    // Google GSI button width: min 200, max 400 para compatibilidad total mobile/desktop
    const btnWidth = Math.min(360, Math.max(220, window.innerWidth - 48))

    google.accounts.id.renderButton(this.googleBtnRef.nativeElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      logo_alignment: 'left',
      width: btnWidth
    })
  }

  iniciarConGoogle(): void {
    if (typeof google === 'undefined' || !google.accounts?.id) {
      alert('El servicio de Google aún se está conectando. Por favor, reintenta en unos instantes.')
      return
    }

    google.accounts.id.prompt()
  }

  private alCompletarGoogleLogin(respuesta: any): void {
    const googleIdToken = respuesta.credential
    if (!googleIdToken) return

    // Guardamos el token y abrimos el selector de rol para que el usuario elija su perfil
    this.pendingGoogleToken.set(googleIdToken)
    this.isRoleModalOpen.set(true)
  }

  seleccionarRolYCompletar(rol: UserRole): void {
    const token = this.pendingGoogleToken()
    if (!token) return

    this.errorGoogle.set(null)
    this.isSubmitting.set(true)

    this.auth.loginGoogle(token, rol).subscribe({
      next: () => {
        this.isSubmitting.set(false)
        this.pendingGoogleToken.set(null)
        this.isRoleModalOpen.set(false)
      },
      error: (err) => {
        this.isSubmitting.set(false)
        const msg = err?.error?.message || 'Error al autenticar con Google. Por favor, intenta nuevamente.'
        this.errorGoogle.set(msg)
      }
    })
  }

  cerrarModalRol(): void {
    this.isRoleModalOpen.set(false)
    this.pendingGoogleToken.set(null)
    this.errorGoogle.set(null)
  }
}
