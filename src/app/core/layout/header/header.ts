import { Component, computed, effect, inject, input, signal, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Navbar } from '../navbar/navbar'
import { RouterLink } from '@angular/router'
import { Auth } from '../../auth/services/auth'
import { BurgerMenu } from '../../../shared/components/burger-menu/burger-menu'
import { Sidebar } from '../sidebar/sidebar'
import { BreakpointObserver } from '@angular/cdk/layout'
import { Perfil } from '../../../features/perfiles/services/perfil'
import { EmpresaService } from '../../../features/enterprise/empresa-perfil/services/empresa'

export interface HeaderModalLink {
  label: string
  route: string
  icon: string
}

@Component({
  imports: [CommonModule, Navbar, RouterLink, BurgerMenu, Sidebar],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements OnInit {
  protected auth = inject(Auth)
  protected perfilService = inject(Perfil)
  protected empresaService = inject(EmpresaService)
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

  // Switch de rol dual: Postulante (búsqueda de empleo corporativo) <-> Freelancer (proyectos independientes)
  readonly isCandidato = computed(() => {
    const rol = this.auth.session()?.rol
    return rol === 'POSTULANTE' || rol === 'FREELANCER'
  })

  togglePostulanteFreelancer(): void {
    const s = this.auth.session()
    if (!s) return
    const nuevoRol = s.rol === 'POSTULANTE' ? 'FREELANCER' : 'POSTULANTE'
    this.auth.cambiarRol(nuevoRol)
  }

  // Normaliza la foto: soporta URLs (http...), Base64 completos o byte[] planos
  readonly fotoUrl = computed(() => {
    const foto = this.perfilService.perfilActual()?.fotoPerfil
    if (!foto) return null
    if (foto.startsWith('data:') || foto.startsWith('http')) return foto
    return `data:image/jpeg;base64,${foto}`
  })

  // Datos reactivos y consistentes del usuario según su rol activo
  readonly userDisplay = computed(() => {
    const s = this.auth.session()
    const rol = s?.rol
    const emp = this.empresaService.empresaActual()
    const perfil = this.perfilService.perfilActual()

    if (rol === 'EMPRESA') {
      const nombre = emp?.nombre || 'InnovaCorp Technologies S.A.'
      return {
        nombre,
        subtitulo: emp?.rubro || 'Tecnología y Software',
        email: emp?.sitio_web ? emp.sitio_web.replace(/^https?:\/\//, '') : 'contacto@innovacorp.com',
        rol: 'EMPRESA',
        badgeClass: 'bg-indigo-50 text-brand-indigo border-brand-indigo/30 shadow-2xs',
        badgeLabel: 'Empresa',
        avatarUrl: emp?.logo || null,
        initial: nombre.charAt(0).toUpperCase() || 'E',
        esEmpresa: true
      }
    }

    if (rol === 'RECRUITER') {
      const nombre = perfil?.nombre ? `${perfil.nombre} ${perfil.apellido || ''}`.trim() : 'Lucía Fernández'
      return {
        nombre,
        subtitulo: 'InnovaCorp Technologies • Reclutamiento',
        email: perfil?.email || 'lucia.fernandez@innovacorp.com',
        rol: 'RECRUITER',
        badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/90 shadow-2xs',
        badgeLabel: 'Recruiter IT',
        avatarUrl: this.fotoUrl(),
        initial: nombre.charAt(0).toUpperCase() || 'R',
        esEmpresa: false
      }
    }

    if (rol === 'POSTULANTE') {
      const nombre = perfil?.nombre ? `${perfil.nombre} ${perfil.apellido || ''}`.trim() : (s?.nombreUsuario || 'Postulante')
      return {
        nombre,
        subtitulo: perfil?.descripcion ? (perfil.descripcion.length > 34 ? perfil.descripcion.slice(0, 34) + '...' : perfil.descripcion) : 'Candidato Activo',
        email: perfil?.email || (s?.nombreUsuario ? `${s.nombreUsuario.toLowerCase()}@worklink.app` : 'postulante@worklink.app'),
        rol: 'POSTULANTE',
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/90 shadow-2xs',
        badgeLabel: 'Postulante',
        avatarUrl: this.fotoUrl(),
        initial: nombre.charAt(0).toUpperCase() || 'P',
        esEmpresa: false
      }
    }

    if (rol === 'CLIENTE') {
      const nombre = perfil?.nombre ? `${perfil.nombre} ${perfil.apellido || ''}`.trim() : (s?.nombreUsuario || 'Cliente')
      return {
        nombre,
        subtitulo: 'Contratante Freelance',
        email: perfil?.email || (s?.nombreUsuario ? `${s.nombreUsuario.toLowerCase()}@worklink.app` : 'cliente@worklink.app'),
        rol: 'CLIENTE',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/90 shadow-2xs',
        badgeLabel: 'Cliente',
        avatarUrl: this.fotoUrl(),
        initial: nombre.charAt(0).toUpperCase() || 'C',
        esEmpresa: false
      }
    }

    // Default FREELANCER
    const nombre = perfil?.nombre ? `${perfil.nombre} ${perfil.apellido || ''}`.trim() : (s?.nombreUsuario || 'Freelancer')
    return {
      nombre,
      subtitulo: perfil?.descripcion ? (perfil.descripcion.length > 34 ? perfil.descripcion.slice(0, 34) + '...' : perfil.descripcion) : 'Desarrollador Freelance',
      email: perfil?.email || (s?.nombreUsuario ? `${s.nombreUsuario.toLowerCase()}@worklink.app` : 'freelancer@worklink.app'),
      rol: 'FREELANCER',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/90 shadow-2xs',
      badgeLabel: 'Freelancer',
      avatarUrl: this.fotoUrl(),
      initial: nombre.charAt(0).toUpperCase() || 'F',
      esEmpresa: false
    }
  })

  // Enlaces de navegación rápida contextuales para el modal
  readonly modalLinks = computed<HeaderModalLink[]>(() => {
    const rol = this.auth.session()?.rol

    if (rol === 'EMPRESA') {
      return [
        { label: 'Dashboard Corporativo', route: '/enterprise/dashboard', icon: 'dashboard' },
        { label: 'Perfil de la Empresa', route: '/enterprise/perfil', icon: 'building' },
        { label: 'Gestión de Vacantes', route: '/enterprise/vacantes', icon: 'briefcase' },
        { label: 'Nómina de Recruiters', route: '/enterprise/recruiters', icon: 'users' },
      ]
    }

    if (rol === 'RECRUITER') {
      return [
        { label: 'Vacantes Asignadas', route: '/enterprise/vacantes', icon: 'briefcase' },
        { label: 'Pipeline de Postulantes', route: '/enterprise/postulantes', icon: 'users' },
        { label: 'Agenda de Entrevistas', route: '/enterprise/entrevistas', icon: 'calendar' },
        { label: 'Mi Perfil de Reclutador', route: '/perfiles/mi-perfil', icon: 'user' },
      ]
    }

    if (rol === 'POSTULANTE') {
      return [
        { label: 'Mi Perfil Profesional', route: '/perfiles/mi-perfil', icon: 'user' },
        { label: 'Catálogo de Vacantes', route: '/enterprise/catalogo', icon: 'search' },
        { label: 'Mis Postulaciones', route: '/enterprise/mis-postulaciones', icon: 'check' },
        { label: 'Mis Entrevistas Virtuales', route: '/enterprise/entrevistas', icon: 'calendar' },
      ]
    }

    if (rol === 'CLIENTE') {
      return [
        { label: 'Mi Perfil', route: '/perfiles/mi-perfil', icon: 'user' },
        { label: 'Mis Proyectos Contratados', route: '/freelance/cliente-dashboard', icon: 'briefcase' },
        { label: 'Publicar Nuevo Proyecto', route: '/freelance/nuevo-proyecto', icon: 'plus' },
      ]
    }

    return [
      { label: 'Mi Perfil Profesional', route: '/perfiles/mi-perfil', icon: 'user' },
      { label: 'Explorar Proyectos', route: '/freelance/proyectos', icon: 'search' },
      { label: 'Mis Trabajos e Hitos', route: '/freelance/mis-trabajos', icon: 'briefcase' },
      { label: 'Mis Finanzas', route: '/freelance/finanzas', icon: 'credit-card' },
    ]
  })

  constructor() {
    effect(() => {
      const s = this.auth.session()
      if (!s) return
      if (s.rol === 'EMPRESA') {
        if (!this.empresaService.empresaActual()) {
          this.empresaService.getMiEmpresa().subscribe()
        }
      } else {
        if (!this.perfilService.perfilActual()) {
          this.perfilService.cargarPerfil().subscribe()
        }
      }
    })
  }

  ngOnInit(): void {
    this.observer.observe(['(max-width: 1024px)']).subscribe((rdo) => {
      this.isMinWidth.set(rdo.matches)
      if (!rdo.matches) {
        this.isMenuOpen.set(false)
      } else {
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
