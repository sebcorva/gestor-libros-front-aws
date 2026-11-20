import { configurarComponente, enviar, escribir } from '../../../testing/configurar';
import { RecuperarComponent } from './recuperar.component';

describe('RecuperarComponent', () => {
  it('flujo completo: pide código, muestra el correo simulado y restablece', async () => {
    const { fixture, http, el } = await configurarComponente(RecuperarComponent);

    escribir(el, '#email', 'ana@test.cl');
    enviar(el);
    http.expectOne('/auth/recuperar').flush({ mensaje: 'Si el email esta registrado...', codigoDemo: '123456', minutosVigencia: 15 });
    await fixture.whenStable();
    expect(el.textContent).toContain('123456');

    escribir(el, '#codigo', '123456');
    escribir(el, '#nuevaPassword', 'Nueva2026!');
    escribir(el, '#confirmar', 'Nueva2026!');
    enviar(el);
    const req = http.expectOne('/auth/restablecer');
    expect(req.request.body).toEqual({ email: 'ana@test.cl', codigo: '123456', nuevaPassword: 'Nueva2026!' });
    req.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();
    expect(el.textContent).toContain('Tu contraseña fue actualizada');
  });

  it('no envía un código que no tenga 6 dígitos', async () => {
    const { fixture, http, el } = await configurarComponente(RecuperarComponent);
    escribir(el, '#email', 'ana@test.cl');
    enviar(el);
    http.expectOne('/auth/recuperar').flush({ mensaje: 'x', codigoDemo: null, minutosVigencia: 15 });
    await fixture.whenStable();

    escribir(el, '#codigo', '12ab');
    escribir(el, '#nuevaPassword', 'Nueva2026!');
    escribir(el, '#confirmar', 'Nueva2026!');
    enviar(el);
    await fixture.whenStable();
    http.expectNone('/auth/restablecer');
    expect(el.textContent).toContain('exactamente 6 dígitos');
  });

  it('código incorrecto o vencido muestra un mensaje claro', async () => {
    const { fixture, http, el } = await configurarComponente(RecuperarComponent);
    escribir(el, '#email', 'ana@test.cl');
    enviar(el);
    http.expectOne('/auth/recuperar').flush({ mensaje: 'x', codigoDemo: '123456', minutosVigencia: 15 });
    await fixture.whenStable();

    escribir(el, '#codigo', '000000');
    escribir(el, '#nuevaPassword', 'Nueva2026!');
    escribir(el, '#confirmar', 'Nueva2026!');
    enviar(el);
    http.expectOne('/auth/restablecer').flush(
      { status: 400, mensaje: 'El codigo es invalido o expiro', detalles: [] },
      { status: 400, statusText: 'Bad Request' }
    );
    await fixture.whenStable();
    expect(el.querySelector('.alert-danger')?.textContent).toContain('incorrecto o ya expiró');
  });
});
