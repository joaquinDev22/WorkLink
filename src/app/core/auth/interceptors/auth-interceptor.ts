import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorage } from '../services/token-storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorage)
  const token = tokenStorage.getToken()

  const request = token ? req.clone({
    setHeaders:{
      Authorization : `Bearer ${token}`
    }
  }) : req
  return next(request)
};
