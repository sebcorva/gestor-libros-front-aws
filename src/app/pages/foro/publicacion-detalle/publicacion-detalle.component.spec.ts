import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../../services/auth.service';
import { publicacionPrueba, sesionPrueba } from '../../../testing/datos-prueba';
import { configurarComponente, escribir } from '../../../testing/configurar';
import { PublicacionDetalleComponent } from './publicacion-detalle.component';

const comentario = (id: number, usuarioId: number, usuarioNombre: string) => ({
  idComentario: id, publicacionId: 1, usuarioId, usuarioNombre, contenido: `Comentario ${id}`, fecha: '2026-11-20T11:00:00',
});

async function abrir(sesion?: ReturnType<typeof sesionPrueba>) {
  const ctx = await configurarComponente(PublicacionDetalleComponent);
  if (sesion) TestBed.inject(AuthService).guardarSesion(sesion);
  ctx.fixture.componentRef.setInput('id', '1');
  await ctx.fixture.whenStable();
  ctx.http.expectOne('/publicaciones/1').flush(publicacionPrueba({ usuarioId: 7 }));
  ctx.http.expectOne('/publicaciones/1/comentarios').flush([comentario(10, 7, 'Elena'), comentario(11, 5, 'Ana')]);
  ctx.http.match('/publicaciones').forEach(r => r.flush([])); // sidebar
  await ctx.fixture.whenStable();
  return ctx;
}

describe('PublicacionDetalleComponent', () => {
  it('muestra la reseña y sus comentarios; un visitante ve la invitación a iniciar sesión', async () => {
    const { el } = await abrir();
    expect(el.querySelector('h1')?.textContent).toContain('Cien años de soledad');
    expect(el.textContent).toContain('Comentario 10');
    expect(el.textContent).toContain('para comentar');
    expect(el.querySelectorAll('[aria-label="Eliminar comentario"]').length).toBe(0);
  });

  it('un usuario comenta y solo puede eliminar sus propios comentarios', async () => {
    const { fixture, http, el } = await abrir(sesionPrueba({ id: 5 }));
    expect(el.querySelectorAll('[aria-label="Eliminar comentario"]').length).toBe(1);

    escribir(el, '#contenido', 'Gran libro');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    const req = http.expectOne('/publicaciones/1/comentarios');
    expect(req.request.body).toEqual({ contenido: 'Gran libro' });
    req.flush(comentario(12, 5, 'Ana'));
    await fixture.whenStable();
    expect(el.textContent).toContain('3 comentarios');
  });

  it('el ADMIN modera: puede eliminar cualquier comentario', async () => {
    const { fixture, http, el } = await abrir(sesionPrueba({ id: 1, rol: 'ADMIN' }));
    const botones = el.querySelectorAll<HTMLButtonElement>('[aria-label="Eliminar comentario"]');
    expect(botones.length).toBe(2);

    botones[0].click();
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('.modal .btn-danger')!.click();
    http.expectOne(r => r.method === 'DELETE' && r.url === '/comentarios/10').flush(null);
    await fixture.whenStable();
    expect(el.textContent).not.toContain('Comentario 10');
  });

  it('una reseña inexistente muestra un mensaje', async () => {
    const ctx = await configurarComponente(PublicacionDetalleComponent);
    ctx.fixture.componentRef.setInput('id', '99');
    await ctx.fixture.whenStable();
    ctx.http.expectOne('/publicaciones/99').flush({ status: 404, mensaje: 'x', detalles: [] }, { status: 404, statusText: 'Not Found' });
    ctx.http.expectOne('/publicaciones/99/comentarios').flush([]);
    ctx.http.match('/publicaciones').forEach(r => r.flush([]));
    await ctx.fixture.whenStable();
    expect(ctx.el.textContent).toContain('no existe o fue eliminada');
  });
});
