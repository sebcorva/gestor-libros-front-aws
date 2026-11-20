import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { ALMACENAMIENTO, AuthService } from './services/auth.service';
import { StorageMemoria, sesionPrueba } from './testing/datos-prueba';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ALMACENAMIENTO, useValue: new StorageMemoria() },
      ],
    }).compileComponents();
  });

  it('muestra la marca y el enlace para iniciar sesión a un visitante', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('.marca')?.textContent).toContain('Libros y');
    expect(html.textContent).toContain('Iniciar sesión');
    expect(html.textContent).not.toContain('Administrar usuarios');
  });

  it('a un ADMIN le muestra el menú de administración', async () => {
    TestBed.inject(AuthService).guardarSesion(sesionPrueba({ rol: 'ADMIN', nombre: 'Admin' }));
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Administrar usuarios');
    expect(html.textContent).toContain('Publicar reseña');
    expect(html.textContent).not.toContain('Iniciar sesión');
  });
});
