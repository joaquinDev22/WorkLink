import { Routes } from '@angular/router';

export const routes: Routes = [
  // --- ZONA FREELANCER ---
  {
    path: 'proyectos',
    loadComponent: () => import('./proyectos-catalogo/pages/proyecto-list/proyecto-list').then(m => m.ProyectoList)
  },
  {
    path: 'proyecto/:id',
    loadComponent: () => import('./proyectos-catalogo/pages/proyecto-detail/proyecto-detail').then(m => m.ProyectoDetail)
  },
  {
    path: 'mis-trabajos',
    loadComponent: () => import('./proyecto-gestion/pages/mis-proyectos-freelancer/mis-proyectos-freelancer').then(m => m.MisProyectosFreelancer)
  },
  {
    path: 'finanzas',
    loadComponent: () => import('./freelancer-finances/pages/finances-view/freelancer-finances').then(m => m.FreelancerFinances)
  },

  // --- ZONA CLIENTE ---
  {
    path: 'cliente-dashboard',
    loadComponent: () => import('./cliente-dashboard/pages/cliente-dash/cliente-dashboard').then(m => m.ClienteDashboard)
  },
  {
    path: 'mis-proyectos',
    loadComponent: () => import('./proyecto-gestion/pages/mis-proyectos-cliente/mis-proyectos-cliente').then(m => m.MisProyectosCliente)
  },
  {
    path: 'nuevo-proyecto',
    loadComponent: () => import('./proyecto-gestion/pages/proyecto-edit/proyecto-edit').then(m => m.ProyectoEdit)
  },
  {
    path: 'proyecto/:id/propuestas',
    loadComponent: () => import('./proyecto-gestion/pages/proyecto-propuestas/proyecto-propuestas').then(m => m.ProyectoPropuestas)
  },

  {
    path: '',
    redirectTo: 'proyectos',
    pathMatch: 'full'
  }
];