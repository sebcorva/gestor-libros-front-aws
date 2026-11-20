import { Genero } from './genero';

// Igual al PublicacionResponse de gestor-biblioteca
export interface Publicacion {
  idPublicacion: number;
  titulo: string;
  autor: string;
  anioPublicacionLibro: string;
  genero: Genero;
  resena: string;
  fechaPublicacion: string;
  usuarioId: number;
  usuarioNombre: string;
}

export interface PublicacionRequest {
  titulo: string;
  autor: string;
  anioPublicacionLibro: string;
  genero: Genero;
  resena: string;
}
