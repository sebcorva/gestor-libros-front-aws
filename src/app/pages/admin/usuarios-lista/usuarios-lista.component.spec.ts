import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../../services/auth.service';
import { sesionPrueba, usuarioPrueba } from '../../../testing/datos-prueba';
import { configurarComponente } from '../../../testing/configurar';
import { UsuariosListaComponent } from './usuarios-lista.component';

const usuarios = [
  usuarioPrueba({ id: 1, nombre: 'Admin', apellido: 'Sistema', email: 'admin@biblioteca.cl', rol: 'ADMIN', premium: true }),
  usuarioPrueba({ id: 2, nombre: 'Ursula', apellido: 'Premium', email: 'premium@biblioteca.cl', premium: true }),
  usuarioPrueba({ id: 3, nombre: 'Pedro', apellido: 'Lector', email: 'usuario@biblioteca.cl' }),
];

async function abrir() {
  const ctx = await configurarComponente(UsuariosListaComponent);
  TestBed.inject(AuthService).guardarSesion(sesionPrueba({ id: 1, rol: 'ADMIN' }));
  ctx.http.expectOne('/usuarios').flush(usuarios);
  await ctx.fixture.whenStable();
  return ctx;
}

describe('UsuariosListaComponent', () => {
  it('lista los usuarios con el resumen', async () => {
    const { el } = await abrir();
    expect(el.querySelectorAll('tbody tr').length).toBe(3);
    expect(el.textContent).toContain('Premium');
  });

  it('busca por nombre o email y filtra por rol', async () => {
    const { fixture, el } = await abrir();
    const buscar = el.querySelector<HTMLInputElement>('#buscar')!;
    buscar.value = 'premium@';
    buscar.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody tr').length).toBe(1);

    buscar.value = '';
    buscar.dispatchEvent(new Event('input'));
    const rol = el.querySelector<HTMLSelectElement>('#rol')!;
    rol.value = 'ADMIN';
    rol.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('elimina con confirmación y no permite eliminarse a sí mismo', async () => {
    const { fixture, http, el } = await abrir();
    const botones = el.querySelectorAll<HTMLButtonElement>('tbody .btn-outline-danger');
    expect(botones[0].disabled).toBe(true); // el propio admin

    botones[2].click();
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('.modal .btn-danger')!.click();
    http.expectOne(r => r.method === 'DELETE' && r.url === '/usuarios/3').flush(null);
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody tr').length).toBe(2);
    expect(el.textContent).toContain('Se eliminó a Pedro Lector');
  });
});
