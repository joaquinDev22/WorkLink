import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../../../core/auth/services/auth';
import { RegisterRequestDTO } from '../../models/auth.models';
import { form, required } from '@angular/forms/signals';

@Component({
  imports: [],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private auth = inject(Auth)

  registerModel = signal<RegisterRequestDTO>({
      usuario: '',
      email: '',
      password: '',
      rol: 'NO_ASIGNADO'
  })

  registerForm = form(this.registerModel, (field) =>{
    required(field.usuario, {message:'El usuario es obligatorio'})
  })
}
