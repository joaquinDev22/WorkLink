import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorage } from '../services/token-storage';
import { environment } from '../../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStorage).getToken()

  // El JWT solo viaja a nuestra API, nunca a dominios de terceros
  const request = token && req.url.startsWith(environment.apiUrl) ? req.clone({
    setHeaders:{
      Authorization : `Bearer ${token}`
    }
  }) : req
  return next(request)
};
