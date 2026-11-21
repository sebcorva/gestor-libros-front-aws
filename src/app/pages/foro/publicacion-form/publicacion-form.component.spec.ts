import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../../services/auth.service';
import { publicacionPrueba, sesionPrueba } from '../../../testing/datos-prueba';
import { configurarComponente, escribir } from '../../../testing/configurar';
import { PublicacionFormComponent } from './publicacion-form.component';

const RESENA = 'Un clásico de la ciencia ficción sobre la caída de un imperio galáctico. Imprescindible.';

function completar(el: HTMLElement, anio = '1951', resena = RESENA) {
  escribir(el, '#titulo', 'Fundación');
  escribir(el, '#autor', 'Isaac Asimov');
  escribir(el, '#anio', anio);
  const genero = el.querySelector<HTMLSelectElement>('#genero')!;
  genero.value = 'CIENCIA_FICCION';
  genero.dispatchEvent(new Event('change'));
  escribir(el, '#resena', resena);
}

describe('PublicacionFormComponent', () => {
  it('publica una reseña válida y va al detalle', async () => {
    const { http, router, el } = await configurarComponente(PublicacionFormComponent);
    completar(el);
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    const req = http.expectOne('/publicaciones');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      titulo: 'Fundación', autor: 'Isaac Asimov', anioPublicacionLibro: '1951', genero: 'CIENCIA_FICCION', resena: RESENA,
    });
    req.flush(publicacionPrueba({ idPublicacion: 4 }));
    expect(router.navigate).toHaveBeenCalledWith(['/resenas', 4], expect.anything());
  });

  it('no envía una reseña corta ni un año futuro', async () => {
    const { fixture, http, el } = await configurarComponente(PublicacionFormComponent);
    completar(el, String(new Date().getFullYear() + 1), 'Muy corta');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    http.expectNone('/publicaciones');
    expect(el.textContent).toContain('Mínimo 50 caracteres');
    expect(el.textContent).toContain('Debe ser menor o igual a');
  });

  it('al editar precarga la reseña del autor y envía PUT', async () => {
    const { fixture, http, el } = await configurarComponente(PublicacionFormComponent);
    TestBed.inject(AuthService).guardarSesion(sesionPrueba({ id: 7, premium: true }));
    fixture.componentRef.setInput('id', '1');
    await fixture.whenStable();
    http.expectOne('/publicaciones/1').flush(publicacionPrueba({ usuarioId: 7 }));
    await fixture.whenStable();
    expect(el.querySelector<HTMLInputElement>('#titulo')?.value).toBe('Cien años de soledad');

    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    const req = http.expectOne(r => r.method === 'PUT' && r.url === '/publicaciones/1');
    req.flush(publicacionPrueba());
  });

  it('si no es el autor, lo devuelve al detalle', async () => {
    const { fixture, http, router } = await configurarComponente(PublicacionFormComponent);
    TestBed.inject(AuthService).guardarSesion(sesionPrueba({ id: 5, rol: 'ADMIN' }));
    fixture.componentRef.setInput('id', '1');
    await fixture.whenStable();
    http.expectOne('/publicaciones/1').flush(publicacionPrueba({ usuarioId: 7 }));
    expect(router.navigate).toHaveBeenCalledWith(['/resenas', 1]);
  });
});
