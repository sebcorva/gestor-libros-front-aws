import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { ALMACENAMIENTO, AuthService } from '../services/auth.service';
import { StorageMemoria, sesionPrueba } from '../testing/datos-prueba';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let auth: AuthService;
  let storage: StorageMemoria;

  beforeEach(() => {
    storage = new StorageMemoria();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: ALMACENAMIENTO, useValue: storage },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => backend.verify());

  it('agrega el token Bearer si hay sesión', () => {
    const sesion = sesionPrueba();
    auth.guardarSesion(sesion);

    http.get('/usuarios/me').subscribe();
    const req = backend.expectOne('/usuarios/me');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${sesion.token}`);
    req.flush({});
  });

  it('no agrega header sin sesión', () => {
    http.get('/publicaciones').subscribe();
    const req = backend.expectOne('/publicaciones');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('ante un 401 con sesión, cierra la sesión y va al login', () => {
    auth.guardarSesion(sesionPrueba());
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    http.get('/usuarios/me').subscribe({ error: () => undefined });
    backend.expectOne('/usuarios/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.autenticado()).toBe(false);
    expect(navegar).toHaveBeenCalledWith(['/login'], expect.objectContaining({ queryParams: expect.any(Object) }));
  });

  it('un 401 del login (credenciales incorrectas) no cierra nada ni redirige', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate');
    http.post('/auth/login', {}).subscribe({ error: () => undefined });
    backend.expectOne('/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(navegar).not.toHaveBeenCalled();
  });
});
