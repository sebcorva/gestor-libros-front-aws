import { HttpErrorResponse } from '@angular/common/http';

import { erroresPorCampo, mensajeError } from './mensaje-error';

const error = (status: number, cuerpo: unknown = null) => new HttpErrorResponse({ status, error: cuerpo });

describe('mensajeError', () => {
  it('traduce los códigos más comunes', () => {
    expect(mensajeError(error(0))).toContain('No pudimos conectar');
    expect(mensajeError(error(403))).toContain('No tienes permisos');
    expect(mensajeError(error(500))).toContain('Error interno');
  });

  it('usa el mensaje del backend en un 409', () => {
    expect(mensajeError(error(409, { mensaje: 'El email ingresado ya esta registrado' })))
      .toBe('El email ingresado ya esta registrado');
  });

  it('usa el mensaje por defecto si no es un error HTTP', () => {
    expect(mensajeError(new Error('x'), 'Por defecto')).toBe('Por defecto');
  });
});

describe('erroresPorCampo', () => {
  it('agrupa los detalles de un 400 por campo', () => {
    const resultado = erroresPorCampo(error(400, {
      detalles: ['password: Debe incluir un numero', 'password: Sin espacios', 'email: Formato invalido'],
    }));
    expect(resultado).toEqual({
      password: ['Debe incluir un numero', 'Sin espacios'],
      email: ['Formato invalido'],
    });
  });

  it('devuelve vacío si no es un 400', () => {
    expect(erroresPorCampo(error(500, { detalles: ['a: b'] }))).toEqual({});
  });
});
