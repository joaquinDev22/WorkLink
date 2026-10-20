import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../../core/auth/services/auth';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})

export class Login {
  private auth = inject(Auth);

  user = signal<string>('');
  password = signal<string>('');

  iniciarSesion(e: Event) {
    e.preventDefault();
    if (this.user().trim() !== '' && this.password().trim() !== '') {
      this.auth.login(this.user());
    } else {
      alert('Por favor ingresa un usuario');
    }
  }
}