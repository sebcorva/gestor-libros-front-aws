import { sesionPrueba } from '../../../testing/datos-prueba';
import { configurarComponente, enviar, escribir } from '../../../testing/configurar';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  it('no envía el formulario si está vacío y muestra los errores', async () => {
    const { fixture, http, el } = await configurarComponente(LoginComponent);
    enviar(el);
    await fixture.whenStable();
    http.expectNone('/auth/login');
    expect(el.querySelectorAll('.invalid-feedback').length).toBeGreaterThan(0);
  });

  it('inicia sesión y vuelve a la página pedida (returnUrl)', async () => {
    const { fixture, http, router, el } = await configurarComponente(LoginComponent);
    fixture.componentRef.setInput('returnUrl', '/perfil');
    escribir(el, '#email', 'ana@test.cl');
    escribir(el, '#password', 'Admin2026!');
    enviar(el);

    http.expectOne('/auth/login').flush(sesionPrueba());
    expect(router.navigateByUrl).toHaveBeenCalledWith('/perfil');
  });

  it('ignora un returnUrl externo', async () => {
    const { fixture, http, router, el } = await configurarComponente(LoginComponent);
    fixture.componentRef.setInput('returnUrl', '//sitio-malicioso.com');
    escribir(el, '#email', 'ana@test.cl');
    escribir(el, '#password', 'Admin2026!');
    enviar(el);

    http.expectOne('/auth/login').flush(sesionPrueba());
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('muestra un mensaje claro ante credenciales incorrectas', async () => {
    const { fixture, http, el } = await configurarComponente(LoginComponent);
    escribir(el, '#email', 'ana@test.cl');
    escribir(el, '#password', 'mala');
    enviar(el);

    http.expectOne('/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();
    expect(el.querySelector('.alert-danger')?.textContent).toContain('Email o contraseña incorrectos');
  });
});
