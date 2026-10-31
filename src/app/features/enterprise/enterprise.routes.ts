import { Routes } from '@angular/router'
import { roleGuard } from '../../core/auth/guards/role-guard'

export const routes: Routes = [
  // --- ZONA POSTULANTE / PÚBLICA ---
  {
    path: 'catalogo',
    loadComponent: () => import('./vacantes/pages/vacante-catalogo/vacante-catalogo').then(m => m.VacanteCatalogo)
  },
  {
    path: 'vacante/:id',
    loadComponent: () => import('./vacantes/pages/vacante-detail/vacante-detail').then(m => m.VacanteDetail)
  },
  {
    path: 'mis-postulaciones',
    canActivate: [roleGuard],
    data: { roles: ['POSTULANTE'] },
    loadComponent: () => import('./vacantes/pages/vacante-postulantes/vacante-postulantes').then(m => m.VacantePostulantes)
  },

  // --- ZONA EXCLUSIVA EMPRESA ---
  {
    path: 'dashboard',
    canActivate: [roleGuard],
    data: { roles: ['EMPRESA'] },
    loadComponent: () => import('./dashboard/pages/empresa-dashboard/empresa-dashboard').then(m => m.EmpresaDashboard)
  },
  {
    path: 'recruiters',
    canActivate: [roleGuard],
    data: { roles: ['EMPRESA'] },
    loadComponent: () => import('./recruiters/pages/recruiter-list/recruiter-list').then(m => m.RecruiterList)
  },

  // --- ZONA ENTREVISTAS (RECRUITER & POSTULANTE) ---
  {
    path: 'entrevistas',
    canActivate: [roleGuard],
    data: { roles: ['RECRUITER', 'POSTULANTE'] },
    loadComponent: () => import('./entrevistas/pages/entrevista-calendar/entrevista-calendar').then(m => m.EntrevistaCalendar)
  },
  {
    path: 'postulantes',
    canActivate: [roleGuard],
    data: { roles: ['RECRUITER'] },
    loadComponent: () => import('./vacantes/pages/vacante-postulantes/vacante-postulantes').then(m => m.VacantePostulantes)
  },

  // --- ADMINISTRACIÓN DE VACANTES ---
  {
    path: 'vacantes',
    canActivate: [roleGuard],
    data: { roles: ['EMPRESA', 'RECRUITER'] },
    loadComponent: () => import('./vacantes/pages/vacante-admin/vacante-admin-list').then(m => m.VacanteAdminList)
  },
  {
    path: '',
    redirectTo: 'catalogo',
    pathMatch: 'full'
  }
]
