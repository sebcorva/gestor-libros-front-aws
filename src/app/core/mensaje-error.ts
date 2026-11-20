import { HttpErrorResponse } from '@angular/common/http';

import { ErrorResponse } from '../models/error-response';

/** Traduce un error HTTP a un mensaje para el usuario. */
export function mensajeError(error: unknown, porDefecto = 'Ocurrió un problema. Inténtalo de nuevo.'): string {
  if (!(error instanceof HttpErrorResponse)) return porDefecto;
  const cuerpo = error.error as Partial<ErrorResponse> | null;
  switch (error.status) {
    case 0:
      return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
    case 401:
      return 'Tu sesión expiró. Inicia sesión nuevamente.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return cuerpo?.mensaje ?? 'No encontramos lo que buscabas.';
    default:
      if (error.status >= 500) return 'Error interno del servidor. Inténtalo más tarde.';
      return cuerpo?.mensaje && cuerpo.mensaje !== 'Error de validacion' ? cuerpo.mensaje : porDefecto;
  }
}

/**
 * Agrupa los `detalles` de un 400 por campo. El backend los envia como "campo: mensaje".
 * Ej.: ["password: La contraseña debe incluir al menos un numero"] -> { password: [...] }
 */
export function erroresPorCampo(error: unknown): Record<string, string[]> {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400) return {};
  const detalles = (error.error as Partial<ErrorResponse> | null)?.detalles ?? [];
  const resultado: Record<string, string[]> = {};
  for (const detalle of detalles) {
    const separador = detalle.indexOf(':');
    if (separador < 0) continue;
    const campo = detalle.slice(0, separador).trim();
    const mensaje = detalle.slice(separador + 1).trim();
    (resultado[campo] ??= []).push(mensaje);
  }
  return resultado;
}
