import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

// Control de acceso a las rutas (el backend vuelve a validar cada request).

/** Requiere sesion iniciada; si no, va al login y vuelve despues. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.sesionVigente()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Solo ADMIN. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.sesionVigente()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  return auth.esAdmin() ? true : router.createUrlTree(['/']);
};

/** Publicar: premium o ADMIN. Un USUARIO sin premium va a la pagina para hacerse premium. */
export const publicarGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.sesionVigente()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  return auth.puedePublicar() ? true : router.createUrlTree(['/premium'], { queryParams: { motivo: 'publicar' } });
};

/** Login, registro y recuperar: si ya hay sesion no tiene sentido mostrarlas. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.sesionVigente() ? inject(Router).createUrlTree(['/']) : true;
};
