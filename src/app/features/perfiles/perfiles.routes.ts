import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'mi-perfil',
    loadComponent: () => import('./pages/mi-perfil/mi-perfil').then(m => m.MiPerfil)
  },
  {
    path: '',
    redirectTo: 'mi-perfil',
    pathMatch: 'full'
  }
];