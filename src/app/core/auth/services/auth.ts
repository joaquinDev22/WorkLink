import { inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';

@Service()
export class Auth {
    private router = inject(Router)

    usuarioActual = signal<string | null>(localStorage.getItem('usuario_worklink'))

    login(nombre : string){
        localStorage.setItem('usuario_worklink', nombre)
        this.usuarioActual.set(nombre)
        this.router.navigate(['/'])
    }
    logout(){
        localStorage.removeItem('usuario_worklink');
        this.usuarioActual.set(null);
        this.router.navigate(['/auth/login']);
    }
}
