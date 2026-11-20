import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';

import {
  LoginRequest, LoginResponse, RecuperarResponse, RegistroRequest, RestablecerRequest, Usuario
} from '../models/usuario';

/** Donde se guarda la sesion: localStorage en el navegador, nada en el servidor (SSR). */
export const ALMACENAMIENTO = new InjectionToken<Storage | null>('ALMACENAMIENTO', {
  providedIn: 'root',
  factory: () => isPlatformBrowser(inject(PLATFORM_ID)) ? inject(DOCUMENT).defaultView?.localStorage ?? null : null,
});

const CLAVE_TOKEN = 'lyl.token';
const CLAVE_USUARIO = 'lyl.usuario';

interface PayloadJwt {
  sub: string;
  rol: string;
  premium: boolean;
  exp: number;
}

/**
 * Sesion del usuario (MVC - Modelo).
 * Singleton: providedIn 'root' -> una sola instancia para toda la app.
 * Observer: la sesion se expone como signals; la navbar, los guards y las vistas
 * reaccionan solos cuando cambia (login, logout, pago premium).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(ALMACENAMIENTO);

  private readonly _token = signal<string | null>(null);
  private readonly _usuario = signal<Usuario | null>(null);

  readonly token = this._token.asReadonly();
  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._token() !== null && this._usuario() !== null);
  readonly esAdmin = computed(() => this._usuario()?.rol === 'ADMIN');
  // El ADMIN tambien puede publicar, igual que un premium
  readonly puedePublicar = computed(() => this.esAdmin() || this._usuario()?.premium === true);

  constructor() {
    this.restaurarSesion();
  }

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', credenciales).pipe(
      tap(respuesta => this.guardarSesion(respuesta))
    );
  }

  registro(datos: RegistroRequest): Observable<Usuario> {
    return this.http.post<Usuario>('/auth/registro', datos);
  }

  recuperar(email: string): Observable<RecuperarResponse> {
    return this.http.post<RecuperarResponse>('/auth/recuperar', { email });
  }

  restablecer(datos: RestablecerRequest): Observable<void> {
    return this.http.post<void>('/auth/restablecer', datos);
  }

  /** Reemplaza token y usuario (login o pago premium, que entrega un token nuevo). */
  guardarSesion(sesion: LoginResponse): void {
    this._token.set(sesion.token);
    this._usuario.set(sesion.usuario);
    this.escribir(CLAVE_TOKEN, sesion.token);
    this.escribir(CLAVE_USUARIO, JSON.stringify(sesion.usuario));
  }

  /** Refresca los datos visibles del usuario despues de editar su perfil. */
  actualizarUsuario(usuario: Usuario): void {
    if (this._usuario()?.id !== usuario.id) return;
    this._usuario.set(usuario);
    this.escribir(CLAVE_USUARIO, JSON.stringify(usuario));
  }

  logout(): void {
    this._token.set(null);
    this._usuario.set(null);
    this.storage?.removeItem(CLAVE_TOKEN);
    this.storage?.removeItem(CLAVE_USUARIO);
  }

  /** true si hay token y aun no vence; si vencio, cierra la sesion. */
  sesionVigente(): boolean {
    const token = this._token();
    if (!token) return false;
    const payload = decodificarJwt(token);
    if (!payload || payload.exp * 1000 <= Date.now()) {
      this.logout();
      return false;
    }
    return true;
  }

  private restaurarSesion(): void {
    const token = this.storage?.getItem(CLAVE_TOKEN);
    const usuario = this.storage?.getItem(CLAVE_USUARIO);
    if (!token || !usuario) return;
    try {
      this._token.set(token);
      this._usuario.set(JSON.parse(usuario) as Usuario);
      this.sesionVigente();
    } catch {
      this.logout();
    }
  }

  private escribir(clave: string, valor: string): void {
    this.storage?.setItem(clave, valor);
  }
}

/** Lee el payload de un JWT (sin verificar la firma: eso lo hace el backend). */
export function decodificarJwt(token: string): PayloadJwt | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
    return JSON.parse(json) as PayloadJwt;
  } catch {
    return null;
  }
}
