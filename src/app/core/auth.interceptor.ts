import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Chain of Responsibility: cada request pasa por este eslabon antes de salir.
 * - Agrega "Authorization: Bearer <token>" si hay sesion.
 * - Si el backend responde 401 con una sesion abierta (token vencido o invalido),
 *   cierra la sesion y manda al login, recordando a donde queria ir el usuario.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();

  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      const esLogin = req.url.startsWith('/auth/');
      if (error instanceof HttpErrorResponse && error.status === 401 && token && !esLogin) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url, sesion: 'expirada' } });
      }
      return throwError(() => error);
    })
  );
};
