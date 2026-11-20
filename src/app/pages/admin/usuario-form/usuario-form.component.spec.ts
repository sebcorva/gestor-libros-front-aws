import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../../services/auth.service';
import { sesionPrueba, usuarioPrueba } from '../../../testing/datos-prueba';
import { configurarComponente, escribir } from '../../../testing/configurar';
import { UsuarioFormComponent } from './usuario-form.component';

describe('UsuarioFormComponent', () => {
  it('crear exige contraseña segura y envía el rol', async () => {
    const { fixture, http, el } = await configurarComponente(UsuarioFormComponent);
    escribir(el, '#nombre', 'Nueva');
    escribir(el, '#apellido', 'Admin');
    escribir(el, '#email', 'nueva@test.cl');
    const rol = el.querySelector<HTMLSelectElement>('#rol')!;
    rol.value = 'ADMIN';
    rol.dispatchEvent(new Event('change'));

    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    http.expectNone('/usuarios');

    escribir(el, '#password', 'Creada2026!');
    escribir(el, '#confirmar', 'Creada2026!');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    const req = http.expectOne('/usuarios');
    expect(req.request.body).toEqual({ nombre: 'Nueva', apellido: 'Admin', email: 'nueva@test.cl', rol: 'ADMIN', password: 'Creada2026!' });
    req.flush(usuarioPrueba({ id: 9 }));
  });

  it('editar sin contraseña no la envía', async () => {
    const { fixture, http, el } = await configurarComponente(UsuarioFormComponent);
    TestBed.inject(AuthService).guardarSesion(sesionPrueba({ id: 1, rol: 'ADMIN' }));
    fixture.componentRef.setInput('id', '3');
    await fixture.whenStable();
    http.expectOne('/usuarios/3').flush(usuarioPrueba({ id: 3, nombre: 'Pedro' }));
    await fixture.whenStable();

    escribir(el, '#nombre', 'Pedro Pablo');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    const req = http.expectOne(r => r.method === 'PUT' && r.url === '/usuarios/3');
    expect(req.request.body.password).toBeUndefined();
    expect(req.request.body.nombre).toBe('Pedro Pablo');
    req.flush(usuarioPrueba({ id: 3 }));
  });

  it('el admin no puede cambiar su propio rol', async () => {
    const { fixture, http, el } = await configurarComponente(UsuarioFormComponent);
    TestBed.inject(AuthService).guardarSesion(sesionPrueba({ id: 1, rol: 'ADMIN' }));
    fixture.componentRef.setInput('id', '1');
    await fixture.whenStable();
    http.expectOne('/usuarios/1').flush(usuarioPrueba({ id: 1, rol: 'ADMIN' }));
    await fixture.whenStable();
    expect(el.querySelector<HTMLSelectElement>('#rol')!.disabled).toBe(true);
  });
});
