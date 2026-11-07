import { Component, model, inject, computed } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Auth } from '../../auth/services/auth'
import { NavItem } from '../navbar/navbar'
import { EmpresaService } from '../../../features/enterprise/empresa-perfil/services/empresa'

@Component({
  imports: [RouterLink],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  isOpen = model<boolean>(false)
  protected auth = inject(Auth)
  protected empresaService = inject(EmpresaService)

  readonly userDisplayName = computed(() => {
    const s = this.auth.session()
    if (s?.rol === 'EMPRESA') return this.empresaService.empresaActual()?.nombre || 'InnovaCorp Technologies'
    if (s?.rol === 'RECRUITER') return 'Lucía Fernández'
    return s?.nombreUsuario || 'Usuario'
  })

  readonly userInitial = computed(() => {
    return this.userDisplayName().charAt(0).toUpperCase() || 'U'
  })

  readonly navItems = computed<NavItem[]>(() => {
    const session = this.auth.session()
    const rol = session?.rol

    if (rol === 'FREELANCER') {
      return [
        { label: 'Mi Perfil', route: '/perfiles/mi-perfil' },
        { label: 'Explorar Proyectos', route: '/freelance/proyectos' },
        { label: 'Mis Proyectos/Hitos', route: '/freelance/mis-trabajos' },
        { label: 'Mis Finanzas', route: '/freelance/finanzas' },
      ]
    }

    if (rol === 'POSTULANTE') {
      return [
        { label: 'Mi Perfil', route: '/perfiles/mi-perfil' },
        { label: 'Explorar Vacantes', route: '/enterprise/catalogo' },
        { label: 'Mis Postulaciones', route: '/enterprise/mis-postulaciones' },
        { label: 'Mis Entrevistas', route: '/enterprise/entrevistas' },
      ]
    }

    if (rol === 'EMPRESA') {
      return [
        { label: 'Perfil Empresa', route: '/enterprise/perfil' },
        { label: 'Dashboard', route: '/enterprise/dashboard' },
        { label: 'Mis Vacantes', route: '/enterprise/vacantes' },
        { label: 'Recruiters', route: '/enterprise/recruiters' },
      ]
    }
    
    if (rol === 'RECRUITER') {
      return [
        { label: 'Mi Perfil', route: '/perfiles/mi-perfil' },
        { label: 'Vacantes Asignadas', route: '/enterprise/vacantes' },
        { label: 'Postulantes', route: '/enterprise/postulantes' },
        { label: 'Entrevistas', route: '/enterprise/entrevistas' },
      ]
    }

    if (rol === 'CLIENTE') {
      return [
        { label: 'Mi Perfil', route: '/perfiles/mi-perfil' },
        { label: 'Mis Proyectos', route: '/freelance/cliente-dashboard' },
        { label: 'Publicar Proyecto', route: '/freelance/nuevo-proyecto' },
      ]
    }

    return []
  })

  cerrar(): void {
    this.isOpen.set(false)
  }
}
