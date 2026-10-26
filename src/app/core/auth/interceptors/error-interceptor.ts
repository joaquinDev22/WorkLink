import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorage } from '../services/token-storage';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorage);

  return next(req).pipe(
    catchError((error) => {
      // 401 Unauthorized (Token vencido) o 403 Forbidden (Sin permisos)
      if (error.status === 401 || error.status === 403) {
        tokenStorage.clear();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};