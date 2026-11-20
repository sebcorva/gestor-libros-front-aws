// Los 14 generos del enum Genero de gestor-biblioteca: son las categorias del foro
export type Genero =
  | 'FICCION' | 'FANTASIA' | 'CIENCIA_FICCION' | 'MISTERIO' | 'THRILLER' | 'ROMANCE' | 'HISTORICO'
  | 'BIOGRAFIA' | 'AUTOAYUDA' | 'TECNOLOGIA' | 'EDUCACION' | 'FILOSOFIA' | 'POESIA' | 'TERROR';

export interface InfoGenero {
  codigo: Genero;
  nombre: string;
  icono: string;   // clase de Bootstrap Icons
  color: string;   // color de la portada generada
}

export const GENEROS: readonly InfoGenero[] = [
  { codigo: 'FICCION', nombre: 'Ficción', icono: 'bi-book', color: '#3D5A80' },
  { codigo: 'FANTASIA', nombre: 'Fantasía', icono: 'bi-stars', color: '#6A4C93' },
  { codigo: 'CIENCIA_FICCION', nombre: 'Ciencia ficción', icono: 'bi-rocket-takeoff', color: '#1B6B73' },
  { codigo: 'MISTERIO', nombre: 'Misterio', icono: 'bi-search', color: '#2E294E' },
  { codigo: 'THRILLER', nombre: 'Thriller', icono: 'bi-lightning-charge', color: '#8B1E3F' },
  { codigo: 'ROMANCE', nombre: 'Romance', icono: 'bi-heart', color: '#C0507A' },
  { codigo: 'HISTORICO', nombre: 'Histórico', icono: 'bi-hourglass-split', color: '#8C6239' },
  { codigo: 'BIOGRAFIA', nombre: 'Biografía', icono: 'bi-person-vcard', color: '#5C677D' },
  { codigo: 'AUTOAYUDA', nombre: 'Autoayuda', icono: 'bi-sun', color: '#D68C1E' },
  { codigo: 'TECNOLOGIA', nombre: 'Tecnología', icono: 'bi-cpu', color: '#2C6E91' },
  { codigo: 'EDUCACION', nombre: 'Educación', icono: 'bi-mortarboard', color: '#3A7D44' },
  { codigo: 'FILOSOFIA', nombre: 'Filosofía', icono: 'bi-lightbulb', color: '#4A4E69' },
  { codigo: 'POESIA', nombre: 'Poesía', icono: 'bi-feather', color: '#9A6FB0' },
  { codigo: 'TERROR', nombre: 'Terror', icono: 'bi-moon-stars', color: '#1E1E24' },
];

export function infoGenero(codigo: string | null | undefined): InfoGenero | undefined {
  return GENEROS.find(g => g.codigo === codigo);
}
