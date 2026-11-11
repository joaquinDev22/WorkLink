import { Routes } from '@angular/router'
import { roleGuard } from '../../core/auth/guards/role-guard'

export const routes: Routes = [
  // --- ZONA FREELANCER ---
  {
    path: 'proyectos',
    loadComponent: () =>
      import('./proyectos-catalogo/pages/proyecto-list/proyecto-list').then((m) => m.ProyectoList)
  },
  {
    path: 'proyecto/:id',
    loadComponent: () =>
      import('./proyectos-catalogo/pages/proyecto-detail/proyecto-detail').then(
        (m) => m.ProyectoDetail
      )
  },
  {
    path: 'proyecto/:id/pagos',
    loadComponent: () =>
      import('./checkout-mercadopago/pages/proyecto-pagos/proyecto-pagos').then(
        (m) => m.ProyectoPagos
      )
  },
  {
    path: 'mis-trabajos',
    loadComponent: () =>
      import('./proyecto-gestion/pages/mis-proyectos-freelancer/mis-proyectos-freelancer').then(
        (m) => m.MisProyectosFreelancer
      )
  },
  {
    path: 'finanzas',
    canActivate: [roleGuard],
    data: { roles: ['FREELANCER'] },
    loadComponent: () =>
      import('./freelancer-finances/pages/finances-view/freelancer-finances').then(
        (m) => m.FreelancerFinances
      )
  },

  // --- RETORNOS DE CHECKOUT PRO (WL-42) ---
  {
    path: 'pagos/success',
    loadComponent: () =>
      import('./checkout-mercadopago/pages/pago-retorno/pago-retorno').then((m) => m.PagoRetorno),
    data: { estadoRetorno: 'success' }
  },
  {
    path: 'pagos/failure',
    loadComponent: () =>
      import('./checkout-mercadopago/pages/pago-retorno/pago-retorno').then((m) => m.PagoRetorno),
    data: { estadoRetorno: 'failure' }
  },
  {
    path: 'pagos/pending',
    loadComponent: () =>
      import('./checkout-mercadopago/pages/pago-retorno/pago-retorno').then((m) => m.PagoRetorno),
    data: { estadoRetorno: 'pending' }
  },

  // --- ZONA CLIENTE ---
  {
    path: 'cliente-dashboard',
    loadComponent: () =>
      import('./cliente-dashboard/pages/cliente-dash/cliente-dashboard').then(
        (m) => m.ClienteDashboard
      )
  },
  {
    path: 'mis-proyectos',
    loadComponent: () =>
      import('./proyecto-gestion/pages/mis-proyectos-cliente/mis-proyectos-cliente').then(
        (m) => m.MisProyectosCliente
      )
  },
  {
    path: 'nuevo-proyecto',
    loadComponent: () =>
      import('./proyecto-gestion/pages/proyecto-edit/proyecto-edit').then((m) => m.ProyectoEdit)
  },
  {
    path: 'proyecto/:id/editar',
    loadComponent: () =>
      import('./proyecto-gestion/pages/proyecto-edit/proyecto-edit').then((m) => m.ProyectoEdit)
  },
  {
    path: 'proyecto/:id/propuestas',
    loadComponent: () =>
      import('./proyecto-gestion/pages/proyecto-propuestas/proyecto-propuestas').then(
        (m) => m.ProyectoPropuestas
      )
  },

  {
    path: '',
    redirectTo: 'proyectos',
    pathMatch: 'full'
  }
]
