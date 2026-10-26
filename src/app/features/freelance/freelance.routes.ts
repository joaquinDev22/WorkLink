import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'proyectos',
    loadComponent: () => import('./proyectos-catalogo/pages/proyecto-list/proyecto-list').then(m => m.ProyectoList)
  },
  {
    path: 'finanzas',
    loadComponent: () => import('./freelancer-finances/pages/finances-view/freelancer-finances').then(m => m.FreelancerFinances)
  },
  {
    path: 'cliente-dashboard',
    loadComponent: () => import('./cliente-dashboard/pages/cliente-dash/cliente-dashboard').then(m => m.ClienteDashboard)
  },
  {
    path: '',
    redirectTo: 'proyectos',
    pathMatch: 'full'
  }
];