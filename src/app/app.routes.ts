import { Routes } from '@angular/router';

import { authGuard, invitadoGuard } from './core/guards';

// MVC - Controlador: decide que vista se muestra segun la URL (protegida por guards)
export const routes: Routes = [
  {
    path: 'login', title: 'Iniciar sesión · Libros y Letras', canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'recuperar', title: 'Recuperar contraseña · Libros y Letras', canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/auth/recuperar/recuperar.component').then(m => m.RecuperarComponent),
  },
  {
    path: 'registro', title: 'Registro · Libros y Letras', canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/auth/registro/registro.component').then(m => m.RegistroComponent),
  },
  {
    path: 'perfil', title: 'Mi perfil · Libros y Letras', canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/perfil/perfil.component').then(m => m.PerfilComponent),
  },
  {
    path: 'premium', title: 'Hazte premium · Libros y Letras', canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/premium/premium.component').then(m => m.PremiumComponent),
  },
];
