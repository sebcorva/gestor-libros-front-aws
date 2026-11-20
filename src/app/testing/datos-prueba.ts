import { LoginResponse, Usuario } from '../models/usuario';

/** JWT falso (firma no valida) con el payload indicado: el front solo lee el payload. */
export function jwtFalso(payload: Record<string, unknown>): string {
  const b64 = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.firma`;
}

export function usuarioPrueba(cambios: Partial<Usuario> = {}): Usuario {
  return {
    id: 5, nombre: 'Ana', apellido: 'Pérez', email: 'ana@test.cl', rol: 'USUARIO',
    premium: false, fechaRegistro: '2026-11-01T10:00:00', ...cambios,
  };
}

export function sesionPrueba(cambios: Partial<Usuario> = {}, segundosVigencia = 3600): LoginResponse {
  const usuario = usuarioPrueba(cambios);
  const token = jwtFalso({
    sub: String(usuario.id), rol: usuario.rol, premium: usuario.premium,
    exp: Math.floor(Date.now() / 1000) + segundosVigencia,
  });
  return { token, tipo: 'Bearer', usuario };
}

/** Storage en memoria para los tests (reemplaza a localStorage via el token ALMACENAMIENTO). */
export class StorageMemoria implements Storage {
  private datos = new Map<string, string>();
  get length(): number { return this.datos.size; }
  clear(): void { this.datos.clear(); }
  getItem(clave: string): string | null { return this.datos.get(clave) ?? null; }
  key(indice: number): string | null { return [...this.datos.keys()][indice] ?? null; }
  removeItem(clave: string): void { this.datos.delete(clave); }
  setItem(clave: string, valor: string): void { this.datos.set(clave, valor); }
}

export function publicacionPrueba(cambios: Partial<import('../models/publicacion').Publicacion> = {}) {
  return {
    idPublicacion: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anioPublicacionLibro: '1967',
    genero: 'FICCION' as const, resena: 'Una saga familiar increíble que mezcla lo cotidiano con lo mágico en Macondo.',
    fechaPublicacion: '2026-11-20T10:00:00', usuarioId: 7, usuarioNombre: 'Elena', ...cambios,
  };
}
