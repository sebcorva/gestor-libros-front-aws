import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../../services/auth.service';
import { sesionPrueba, usuarioPrueba } from '../../../testing/datos-prueba';
import { configurarComponente, escribir } from '../../../testing/configurar';
import { PerfilComponent } from './perfil.component';

async function crear() {
  const ctx = await configurarComponente(PerfilComponent);
  TestBed.inject(AuthService).guardarSesion(sesionPrueba());
  ctx.http.expectOne('/usuarios/me').flush(usuarioPrueba());
  ctx.http.expectOne('/pagos').flush([]);
  await ctx.fixture.whenStable();
  return ctx;
}

describe('PerfilComponent', () => {
  it('precarga los datos del usuario', async () => {
    const { el } = await crear();
    expect(el.querySelector<HTMLInputElement>('#nombre')?.value).toBe('Ana');
    expect(el.textContent).toContain('ana@test.cl');
  });

  it('guarda los datos SIN enviar la contraseña', async () => {
    const { fixture, http, el } = await crear();
    escribir(el, '#nombre', 'Ana María');
    el.querySelectorAll('form')[0].dispatchEvent(new Event('submit'));

    const req = http.expectOne('/usuarios/5');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nombre: 'Ana María', apellido: 'Pérez', email: 'ana@test.cl' });
    req.flush(usuarioPrueba({ nombre: 'Ana María' }));
    await fixture.whenStable();
    expect(el.textContent).toContain('Tus datos fueron actualizados');
    expect(TestBed.inject(AuthService).usuario()?.nombre).toBe('Ana María');
  });

  it('no cambia la contraseña si no cumple las reglas', async () => {
    const { fixture, http, el } = await crear();
    escribir(el, '#password', 'corta');
    escribir(el, '#confirmar', 'corta');
    el.querySelectorAll('form')[1].dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    http.expectNone('/usuarios/5');
  });

  it('cambia la contraseña enviando los datos actuales', async () => {
    const { http, el } = await crear();
    escribir(el, '#password', 'Nueva2026!');
    escribir(el, '#confirmar', 'Nueva2026!');
    el.querySelectorAll('form')[1].dispatchEvent(new Event('submit'));
    const req = http.expectOne('/usuarios/5');
    expect(req.request.body.password).toBe('Nueva2026!');
    req.flush(usuarioPrueba());
  });
});

