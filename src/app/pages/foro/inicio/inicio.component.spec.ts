import { publicacionPrueba } from '../../../testing/datos-prueba';
import { configurarComponente } from '../../../testing/configurar';
import { InicioComponent } from './inicio.component';

describe('InicioComponent', () => {
  it('muestra el feed de publicaciones', async () => {
    const { fixture, http, el } = await configurarComponente(InicioComponent);
    const lista = [publicacionPrueba(), publicacionPrueba({ idPublicacion: 2, titulo: 'Fundación', autor: 'Isaac Asimov', genero: 'CIENCIA_FICCION' })];
    http.match('/publicaciones').forEach(r => r.flush(lista)); // feed + sidebar
    await fixture.whenStable();
    expect(el.querySelectorAll('app-publicacion-card').length).toBe(2);
    expect(el.textContent).toContain('Descubriendo “Fundación” de Isaac Asimov');
    expect(el.textContent).toContain('Géneros populares');
  });

  it('busca con ?q= y muestra el estado vacío', async () => {
    const { fixture, http, el } = await configurarComponente(InicioComponent);
    http.match('/publicaciones').forEach(r => r.flush([]));
    fixture.componentRef.setInput('q', 'tolkien');
    await fixture.whenStable();

    const busqueda = http.expectOne(r => r.url === '/publicaciones' && r.params.get('q') === 'tolkien');
    busqueda.flush([]);
    await fixture.whenStable();
    expect(el.textContent).toContain('Resultados para “tolkien”');
    expect(el.textContent).toContain('No encontramos reseñas');
  });

  it('muestra un error con opción de reintentar si la API no responde', async () => {
    const { fixture, http, el } = await configurarComponente(InicioComponent);
    http.match('/publicaciones').forEach(r => r.flush(null, { status: 0, statusText: 'Unknown Error' }));
    await fixture.whenStable();
    expect(el.textContent).toContain('No pudimos conectar con el servidor');
    expect(el.textContent).toContain('Reintentar');
  });
});
