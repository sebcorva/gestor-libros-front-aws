import { Routes } from '@angular/router';

import { adminGuard, authGuard, invitadoGuard, publicarGuard } from './core/guards';

// MVC - Controlador: decide que vista se muestra segun la URL (protegida por guards)
export const routes: Routes = [
  {
    path: '', pathMatch: 'full', title: 'Libros y Letras · Foro de recomendaciones de libros',
    loadComponent: () => import('./pages/foro/inicio/inicio.component').then(m => m.InicioComponent),
  },
  {
    path: 'categoria/:genero', title: 'Categoría · Libros y Letras',
    loadComponent: () => import('./pages/foro/categoria/categoria.component').then(m => m.CategoriaComponent),
  },
  // Las vistas de reseñas usan /resenas (no /publicaciones): /publicaciones es la ruta de la API y
  // Nginx la envia al backend, asi que un F5 en /publicaciones/12 mostraria el JSON en vez de la app.
  // 'resenas/nueva' va antes que 'resenas/:id' para que "nueva" no se tome como id
  {
    path: 'resenas/nueva', title: 'Publicar reseña · Libros y Letras', canActivate: [publicarGuard],
    loadComponent: () => import('./pages/foro/publicacion-form/publicacion-form.component').then(m => m.PublicacionFormComponent),
  },
  {
    path: 'resenas/:id/editar', title: 'Editar reseña · Libros y Letras', canActivate: [authGuard],
    loadComponent: () => import('./pages/foro/publicacion-form/publicacion-form.component').then(m => m.PublicacionFormComponent),
  },
  {
    path: 'resenas/:id', title: 'Reseña · Libros y Letras',
    loadComponent: () => import('./pages/foro/publicacion-detalle/publicacion-detalle.component').then(m => m.PublicacionDetalleComponent),
  },
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
  {
    path: 'admin/usuarios', canActivate: [adminGuard],
    children: [
      {
        path: '', title: 'Administrar usuarios · Libros y Letras',
        loadComponent: () => import('./pages/admin/usuarios-lista/usuarios-lista.component').then(m => m.UsuariosListaComponent),
      },
      {
        path: 'nuevo', title: 'Nuevo usuario · Libros y Letras',
        loadComponent: () => import('./pages/admin/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent),
      },
      {
        path: ':id/editar', title: 'Editar usuario · Libros y Letras',
        loadComponent: () => import('./pages/admin/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
