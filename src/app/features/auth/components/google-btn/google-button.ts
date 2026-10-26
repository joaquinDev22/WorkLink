import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '../../../../core/auth/services/auth';
import { environment } from '../../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-google-button',
  imports: [],
  styleUrl: './google-button.css',
  templateUrl: './google-button.html',
})
export class GoogleButton implements OnInit {
  private auth = inject(Auth);

  ngOnInit(): void {
    this.configurarGoogle();
  }

  private configurarGoogle(): void {
    if (typeof google === 'undefined') {
      console.warn('La librería de Google aún no está cargada.');
      return;
    }

    if (!environment.googleClientId) {
      console.warn('Google Client ID no configurado en environment.');
      return;
    }

    // Inicializamos Google para que sepa qué hacer cuando el usuario seleccione su cuenta
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (respuesta: any) => this.alCompletarGoogleLogin(respuesta),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  // Método que se ejecuta cuando haces clic en tu botón de Tailwind
  iniciarConGoogle(): void {
    if (typeof google === 'undefined') {
      alert('El servicio de Google aún no está listo. Intenta de nuevo en unos segundos.');
      return;
    }

    // Le pedimos a Google que abra el selector oficial de cuentas
    google.accounts.id.prompt((notificacion: any) => {
      if (notificacion.isNotDisplayed()) {
        console.warn('El selector no se mostró por:', notificacion.getNotDisplayedReason());
      }
      if (notificacion.isSkippedMoment()) {
        console.warn('El selector fue omitido por:', notificacion.getSkippedReason());
      }
    });
  }

  private alCompletarGoogleLogin(respuesta: any): void {
    const googleIdToken = respuesta.credential;
    console.log('¡Token recibido de Google con éxito!:', googleIdToken);

    // Enviamos el token al servicio Auth
    this.auth.loginGoogle(googleIdToken).subscribe({
      next: (res) => console.log('Login exitoso en WorkLink:', res),
      error: (err) => console.error('Error al autenticar en el backend:', err)
    });
  }
}