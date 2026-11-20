import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { StorageMemoria, sesionPrueba } from '../testing/datos-prueba';
import { ALMACENAMIENTO, AuthService, decodificarJwt } from './auth.service';

describe('AuthService', () => {
  let http: HttpTestingController;
  let storage: StorageMemoria;

  const crear = () => TestBed.inject(AuthService);

  beforeEach(() => {
    storage = new StorageMemoria();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: ALMACENAMIENTO, useValue: storage }] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('login guarda la sesión en signals y en localStorage', () => {
    const auth = crear();
    const sesion = sesionPrueba({ rol: 'ADMIN' });

    auth.login({ email: 'ana@test.cl', password: 'Admin2026!' }).subscribe();
    const req = http.expectOne('/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(sesion);

    expect(auth.autenticado()).toBe(true);
    expect(auth.esAdmin()).toBe(true);
    expect(auth.puedePublicar()).toBe(true);
    expect(storage.getItem('lyl.token')).toBe(sesion.token);
  });

  it('un USUARIO sin premium no puede publicar', () => {
    const auth = crear();
    auth.guardarSesion(sesionPrueba({ premium: false }));
    expect(auth.puedePublicar()).toBe(false);

    auth.guardarSesion(sesionPrueba({ premium: true }));
    expect(auth.puedePublicar()).toBe(true);
  });

  it('restaura la sesión guardada al iniciar', () => {
    const sesion = sesionPrueba();
    storage.setItem('lyl.token', sesion.token);
    storage.setItem('lyl.usuario', JSON.stringify(sesion.usuario));

    expect(crear().usuario()?.email).toBe('ana@test.cl');
  });

  it('descarta una sesión guardada con el token vencido', () => {
    const sesion = sesionPrueba({}, -60);
    storage.setItem('lyl.token', sesion.token);
    storage.setItem('lyl.usuario', JSON.stringify(sesion.usuario));

    const auth = crear();
    expect(auth.autenticado()).toBe(false);
    expect(storage.getItem('lyl.token')).toBeNull();
  });

  it('logout limpia todo', () => {
    const auth = crear();
    auth.guardarSesion(sesionPrueba());
    auth.logout();
    expect(auth.autenticado()).toBe(false);
    expect(storage.getItem('lyl.usuario')).toBeNull();
  });

  it('decodificarJwt lee el payload', () => {
    expect(decodificarJwt(sesionPrueba({ rol: 'ADMIN' }).token)?.rol).toBe('ADMIN');
    expect(decodificarJwt('no-es-un-jwt')).toBeNull();
  });
});
