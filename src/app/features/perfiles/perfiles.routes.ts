import { Routes } from '@angular/router';
import { pendingChangesGuard } from '../../core/auth/guards/pending-changes-guard';

export const routes: Routes = [
  {
    path: 'mi-perfil',
    loadComponent: () => import('./pages/mi-perfil/mi-perfil').then(m => m.MiPerfil),
    canDeactivate:[pendingChangesGuard]
  },
  {
    path: '',
    redirectTo: 'mi-perfil',
    pathMatch: 'full'
  }
];