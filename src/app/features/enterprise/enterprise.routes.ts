import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'vacantes',
    loadComponent: () => import('./vacantes/pages/vacante-admin/vacante-admin-list').then(m => m.VacanteAdminList)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/pages/empresa-dashboard/empresa-dashboard').then(m => m.EmpresaDashboard)
  },
  {
    path: 'recruiters',
    loadComponent: () => import('./recruiters/pages/recruiter-list/recruiter-list').then(m => m.RecruiterList)
  },
  {
    path: 'entrevistas',
    loadComponent: () => import('./entrevistas/pages/entrevista-calendar/entrevista-calendar').then(m => m.EntrevistaCalendar)
  },
  {
    path: '',
    redirectTo: 'vacantes',
    pathMatch: 'full'
  }
];