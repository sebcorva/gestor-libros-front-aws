// Igual al ComentarioResponse de gestor-biblioteca
export interface Comentario {
  idComentario: number;
  publicacionId: number;
  usuarioId: number;
  usuarioNombre: string;
  contenido: string;
  fecha: string;
}
