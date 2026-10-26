import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../auth/services/auth';

export interface NavItem {
  label: string;
  route: string;
}

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected auth = inject(Auth);

  pildoraX = signal(0);
  pildoraW = signal(0);
  pildoraVisible = signal(false);

  // Lista dinámica de enlaces calculada reactivamente según el rol
  readonly navItems = computed<NavItem[]>(() => {
    const session = this.auth.session();
    const rol = session?.rol;

    if (rol === 'FREELANCER') {
      return [
        { label: 'Explorar Proyectos', route: '/freelance/proyectos' },
        { label: 'Explorar Proyectos', route: '/freelance/proyectos' },
        { label: 'Mis Finanzas', route: '/freelance/finanzas' },
      ];
    }

    if (rol === 'EMPRESA') {
      return [
        { label: 'Dashboard', route: '/enterprise/dashboard' },
        { label: 'Mis Vacantes', route: '/enterprise/vacantes' },
        { label: 'Recruiters', route: '/enterprise/recruiters' },
      ];
    }
    
    if (rol === 'RECRUITER') {
      return [
        { label: 'Vacantes Asignadas', route: '/enterprise/vacantes' },
        { label: 'Postulantes', route: '/enterprise/postulantes' },
        { label: 'Entrevistas', route: '/enterprise/entrevistas' },
      ];
    }

    if (rol === 'CLIENTE') {
      return [
        { label: 'Mis Proyectos', route: '/freelance/cliente-dashboard' },
        { label: 'Publicar Proyecto', route: '/freelance/proyectos' },
      ];
    }

    return [];
  });

  moverPildora(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    this.pildoraX.set(el.offsetLeft);
    this.pildoraW.set(el.offsetWidth);
    this.pildoraVisible.set(true);
  }

  ocultarPildora() {
    this.pildoraVisible.set(false);
  }
}