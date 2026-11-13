import { TokenStorage } from './../services/token-storage';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router)
  const tokenStorage = inject(TokenStorage)

  const token = tokenStorage.getToken()

  if(!token){
    return router.createUrlTree(['/auth/login'])
  }

  return true
};
