import { TokenStorage } from './../services/token-storage';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router)
  const tokenStorage = inject(TokenStorage)

  if(environment.bypassAuth){
    return true
  }

  const token = tokenStorage.getToken()

  if(!token){
    return router.createUrlTree(['/login'])
  }

  return true
};
