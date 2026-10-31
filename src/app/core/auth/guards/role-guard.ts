import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { TokenStorage } from '../services/token-storage'
import { UserRole } from '../../models/user-role'
import { environment } from '../../../../environments/environment'

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router)
  const tokenStorage = inject(TokenStorage)

  // 1. MODO DESARROLLO (Bypass activo): Permitir navegar libremente
  if (environment.bypassAuth) {
    return true
  }

  // 2. Leemos la sesión actual del usuario
  const session = tokenStorage.getSession()

  // Si no hay sesión (o no tiene rol), al login
  if (!session || !session.rol) {
    return router.createUrlTree(['/auth/login'])
  }

  // 3. Obtenemos la lista de roles permitidos configurada en la ruta
  const rolesPermitidos = route.data?.['roles'] as UserRole[] | undefined

  // 4. Si la ruta especificó roles y el rol del usuario NO está en la lista:
  if (rolesPermitidos && !rolesPermitidos.includes(session.rol)) {
    console.warn(`Acceso denegado: El rol '${session.rol}' no tiene permisos para esta ruta.`)
    // Redirigimos a la pantalla de error 403
    return router.createUrlTree(['/error'], { queryParams: { codigo: 403 } })
  }

  // 5. El usuario tiene el rol adecuado: acceso permitido
  return true
}
