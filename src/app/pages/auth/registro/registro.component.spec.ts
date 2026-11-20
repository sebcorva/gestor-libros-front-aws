import { sesionPrueba, usuarioPrueba } from '../../../testing/datos-prueba';
import { configurarComponente, enviar, escribir } from '../../../testing/configurar';
import { RegistroComponent } from './registro.component';

async function completar(el: HTMLElement, password: string, confirmar = password) {
  escribir(el, '#nombre', 'Ana');
  escribir(el, '#apellido', 'Pérez');
  escribir(el, '#email', 'ana@test.cl');
  escribir(el, '#password', password);
  escribir(el, '#confirmar', confirmar);
  const terminos = el.querySelector<HTMLInputElement>('#terminos')!;
  terminos.click();
}

describe('RegistroComponent', () => {
  it('no se envía con una contraseña débil', async () => {
    const { fixture, http, el } = await configurarComponente(RegistroComponent);
    await completar(el, 'debil');
    enviar(el);
    await fixture.whenStable();
    http.expectNone('/auth/registro');
    expect(el.textContent).toContain('La contraseña no cumple todos los requisitos');
  });

  it('no se envía si las contraseñas no coinciden', async () => {
    const { fixture, http, el } = await configurarComponente(RegistroComponent);
    await completar(el, 'Segura2026!', 'Otra2026!');
    enviar(el);
    await fixture.whenStable();
    http.expectNone('/auth/registro');
    expect(el.textContent).toContain('Las contraseñas no coinciden');
  });

  it('registra, inicia sesión y va al foro', async () => {
    const { http, router, el } = await configurarComponente(RegistroComponent);
    await completar(el, 'Segura2026!');
    enviar(el);

    const registro = http.expectOne('/auth/registro');
    expect(registro.request.body).toEqual({ nombre: 'Ana', apellido: 'Pérez', email: 'ana@test.cl', password: 'Segura2026!' });
    registro.flush(usuarioPrueba());
    http.expectOne('/auth/login').flush(sesionPrueba());
    expect(router.navigate).toHaveBeenCalledWith(['/'], expect.anything());
  });

  it('muestra el 409 de email repetido', async () => {
    const { fixture, http, el } = await configurarComponente(RegistroComponent);
    await completar(el, 'Segura2026!');
    enviar(el);
    http.expectOne('/auth/registro').flush(
      { status: 409, mensaje: 'El email ingresado ya esta registrado', detalles: [] },
      { status: 409, statusText: 'Conflict' }
    );
    await fixture.whenStable();
    expect(el.querySelector('.alert-danger')?.textContent).toContain('ya esta registrado');
  });
});
