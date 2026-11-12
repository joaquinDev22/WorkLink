import { Component, inject, signal, OnInit } from '@angular/core'
import { Auth } from '../../../../core/auth/services/auth'
import { GoogleButton } from '../../components/google-btn/google-button'
import { form, FormField, required } from '@angular/forms/signals'
import { LoginRequestDTO } from '../../models/auth.models'
import { RouterLink } from '@angular/router'

@Component({
  imports: [FormField, GoogleButton, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private auth = inject(Auth)
  isLoading = signal(false)
  hasSubmitted = signal(false)
  errorMsg = signal<string | null>(null)

  showPassword = signal<boolean>(false)
  rememberMe = signal<boolean>(false)

  // Modal de recuperación de contraseña

  loginModel = signal<LoginRequestDTO>({
    usuario: '',
    password: ''
  })

  loginForm = form(this.loginModel, (field) => {
    required(field.usuario, { message: 'El usuario es obligatorio' })
    required(field.password, { message: 'La contraseña es obligatoria' })
  })

  ngOnInit(): void {
    const savedUser = localStorage.getItem('worklink_remember_user')
    if (savedUser) {
      this.loginModel.update(m => ({ ...m, usuario: savedUser }))
      this.rememberMe.set(true)
    }
  }

  toggleRememberMe(event: Event): void {
    const input = event.target as HTMLInputElement
    this.rememberMe.set(input.checked)
  }

  iniciarSesion(e: Event) {
    e.preventDefault()
    this.hasSubmitted.set(true)

    if (this.loginForm().invalid()) {
      return
    }

    this.isLoading.set(true)
    this.errorMsg.set(null)
    const data = this.loginModel()

    // Gestionar persistencia de "Recuérdame"
    if (this.rememberMe()) {
      localStorage.setItem('worklink_remember_user', data.usuario)
    } else {
      localStorage.removeItem('worklink_remember_user')
    }

    this.auth.login(data).subscribe({
      next: () => {
        this.isLoading.set(false)
      },
      error: (err) => {
        this.isLoading.set(false)
        const msg = err?.error?.message || 'Usuario o contraseña incorrectos. Por favor, verifica tus datos.'
        this.errorMsg.set(msg)
      }
    })
  }
}
