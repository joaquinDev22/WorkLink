import { Component, inject, signal } from '@angular/core'
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
export class Login {
  private auth = inject(Auth)
  isLoading = signal(false)
  errorMsg = signal<string | null>(null)

  showPassword = signal<boolean>(false)
  loginModel = signal<LoginRequestDTO>({
    usuario: '',
    password: ''
  })

  loginForm = form(this.loginModel, (field) => {
    required(field.usuario, { message: 'El usuario es obligatorio' })
    required(field.password, { message: 'La contraseña es obligatoria' })
  })

  iniciarSesion(e: Event) {
    e.preventDefault()

    if (this.loginForm().invalid()) {
      return
    }

    console.log(this.loginForm().invalid())
    const data = this.loginModel()

    this.auth.login(data).subscribe({
      next: (res) => {
        console.log('Sesión iniciada con éxito:', res)
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err)
      }
    })
  }
  
  onClick() : void{
    console.log(this.loginForm().errors())
  }
}
