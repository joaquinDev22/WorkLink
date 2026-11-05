import { Component, computed, effect, inject, input, signal, OnInit } from '@angular/core'
import { Navbar } from '../navbar/navbar'
import { RouterLink } from '@angular/router'
import { Auth } from '../../auth/services/auth'
import { BurgerMenu } from '../../../shared/components/burger-menu/burger-menu'
import { Sidebar } from '../sidebar/sidebar'
import { BreakpointObserver } from '@angular/cdk/layout'
import { Perfil } from '../../../features/perfiles/services/perfil'

@Component({
  imports: [Navbar, RouterLink, BurgerMenu, Sidebar],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements OnInit {
  protected auth = inject(Auth)
  protected perfilService = inject(Perfil)
  private observer = inject(BreakpointObserver)

  isMinWidth = signal<boolean>(false)
  isMenuOpen = signal<boolean>(false)
  isUserModalOpen = signal<boolean>(false)
  floating = input<boolean>(true)

  // Redirección del logo según el rol
  readonly homeRoute = computed(() => {
    const s = this.auth.session()
    if (!s) return '/'
    if (s.rol === 'EMPRESA') return '/enterprise/dashboard'
    if (s.rol === 'RECRUITER') return '/enterprise/vacantes'
    if (s.rol === 'CLIENTE') return '/freelance/cliente-dashboard'
    if (s.rol === 'POSTULANTE') return '/enterprise/catalogo'
    return '/freelance/proyectos'
  })

  // Enlace dinámico al perfil correspondiente según el rol
  readonly perfilRoute = computed(() => {
    const s = this.auth.session()
    if (s?.rol === 'EMPRESA') return '/enterprise/perfil'
    return '/perfiles/mi-perfil'
  })

  readonly perfilLabel = computed(() => {
    const s = this.auth.session()
    if (s?.rol === 'EMPRESA') return 'Perfil de la Empresa'
    return 'Ver mi perfil completo'
  })

  readonly mostrarCompletitud = computed(() => {
    const s = this.auth.session()
    return s?.rol === 'FREELANCER' || s?.rol === 'POSTULANTE'
  })

  // Normaliza la foto: soporta URLs (http...), Base64 completos o byte[] planos
  readonly fotoUrl = computed(() => {
    const foto = this.perfilService.perfilActual()?.fotoPerfil
    if (!foto) return null
    if (foto.startsWith('data:') || foto.startsWith('http')) return foto
    return `data:image/jpeg;base64,${foto}`
  })
  
  constructor() {
    // Cuando hay sesión y aún no se cargó el perfil, lo solicita reactivamente si no es empresa
    effect(() => {
      const s = this.auth.session()
      if (s && s.rol !== 'EMPRESA' && !this.perfilService.perfilActual()) {
        this.perfilService.cargarPerfil().subscribe()
      }
    })
  }

  ngOnInit(): void {
    this.observer.observe(['(max-width: 1024px)']).subscribe((rdo) => {
      this.isMinWidth.set(rdo.matches)
      if (!rdo.matches) {
        this.isMenuOpen.set(false)
      } else {
        // En móvil el modal de desktop se cierra para dar prioridad al sidebar
        this.isUserModalOpen.set(false)
      }
    })
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v)
  }

  toggleUserModal(): void {
    this.isUserModalOpen.update(v => !v)
  }

  cerrarUserModal(): void {
    this.isUserModalOpen.set(false)
  }
}
