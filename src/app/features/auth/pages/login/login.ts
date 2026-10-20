import { Component, inject, signal } from '@angular/core'
import { Auth } from '../../../../core/auth/services/auth'
import { GoogleButton } from '../../components/google-btn/google-button'
import { form, FormField, required } from '@angular/forms/signals'
import { LoginRequestDTO } from '../../models/auth.models'

@Component({
  imports: [FormField, GoogleButton],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})

export class Login {
  private auth = inject(Auth)

  loginModel = signal<LoginRequestDTO>({
    usuario: '',
    password: ''
  })

  loginForm = form(this.loginModel, (field) => {
    required(field.usuario, {message:'El usuario es obligatorio'})
    required(field.password, {message:'La contraseña es obligatoria'})
  })
  iniciarSesion(e: Event) {
    e.preventDefault()

    if (this.loginForm().invalid()){
      return
    }
    const data = this.loginModel()
    this.auth.login(data)
  }
}