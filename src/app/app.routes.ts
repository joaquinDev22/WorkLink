import { Routes } from '@angular/router'
import { authGuard } from './core/auth/guards/auth-guard'
import { roleGuard } from './core/auth/guards/role-guard'

export const routes: Routes = [
  // 1. ZONA PÚBLICA (Con Header y Footer de Landing)
  {
    path: '',
    loadComponent: () => import('./core/layout/public-layout/public-layout').then(m => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/landing/landing-page').then(m => m.LandingPage),
        pathMatch: 'full'
      },
      {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.routes)
      },
      {
        path: 'error',
        loadComponent: () => import('./core/layout/error-page/error-page').then(m => m.ErrorPage)
      }
    ]
  },

  // 2. ZONA PRIVADA (Dashboard de trabajo a pantalla completa con Sidebar por Rol)
  {
    path: '',
    loadComponent: () => import('./core/layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'enterprise',
        canActivate: [roleGuard],
        data: { roles: ['EMPRESA', 'RECRUITER', 'POSTULANTE'] },
        loadChildren: () => import('./features/enterprise/enterprise.routes').then(m => m.routes)
      },
      {
        path: 'freelance',
        canActivate: [roleGuard],
        data: { roles: ['FREELANCER', 'CLIENTE'] },
        loadChildren: () => import('./features/freelance/freelance.routes').then(m => m.routes)
      },
      {
        path: 'perfiles',
        loadChildren: () => import('./features/perfiles/perfiles.routes').then(m => m.routes)
      },
      {
        path: 'perfil',
        redirectTo: 'perfiles/mi-perfil',
        pathMatch: 'full'
      }
    ]
  },

  // 3. CATCH-ALL: Cualquier ruta no reconocida carga la pantalla de error 404
  {
    path: '**',
    loadComponent: () => import('./core/layout/public-layout/public-layout').then(m => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./core/layout/error-page/error-page').then(m => m.ErrorPage),
        data: { codigo: 404 }
      }
    ]
  }
]
