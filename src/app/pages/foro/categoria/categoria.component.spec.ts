import { publicacionPrueba } from '../../../testing/datos-prueba';
import { configurarComponente } from '../../../testing/configurar';
import { CategoriaComponent } from './categoria.component';

const lista = [
  publicacionPrueba(),
  publicacionPrueba({ idPublicacion: 2, titulo: 'Fundación', autor: 'Isaac Asimov', genero: 'CIENCIA_FICCION' }),
  publicacionPrueba({ idPublicacion: 3, titulo: 'Dune', autor: 'Frank Herbert', genero: 'CIENCIA_FICCION' }),
];

describe('CategoriaComponent', () => {
  it('filtra las publicaciones por el género de la ruta y por texto', async () => {
    const { fixture, http, el } = await configurarComponente(CategoriaComponent);
    fixture.componentRef.setInput('genero', 'CIENCIA_FICCION');
    await fixture.whenStable();
    http.match('/publicaciones').forEach(r => r.flush(lista));
    await fixture.whenStable();

    expect(el.querySelector('h1')?.textContent).toContain('Ciencia ficción');
    expect(el.querySelectorAll('app-publicacion-card').length).toBe(2);

    const filtro = el.querySelector<HTMLInputElement>('#filtro')!;
    filtro.value = 'herbert';
    filtro.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(el.querySelectorAll('app-publicacion-card').length).toBe(1);
  });

  it('un género inexistente muestra las categorías disponibles', async () => {
    const { fixture, http, el } = await configurarComponente(CategoriaComponent);
    fixture.componentRef.setInput('genero', 'COCINA');
    await fixture.whenStable();
    http.match('/publicaciones').forEach(r => r.flush(lista));
    await fixture.whenStable();
    expect(el.textContent).toContain('Esa categoría no existe');
    expect(el.querySelectorAll('.chip').length).toBe(14);
  });
});
