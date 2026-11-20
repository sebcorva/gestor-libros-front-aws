import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Comentario } from '../models/comentario';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private readonly http = inject(HttpClient);

  listar(idPublicacion: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`/publicaciones/${idPublicacion}/comentarios`);
  }

  crear(idPublicacion: number, contenido: string): Observable<Comentario> {
    return this.http.post<Comentario>(`/publicaciones/${idPublicacion}/comentarios`, { contenido });
  }

  eliminar(idComentario: number): Observable<void> {
    return this.http.delete<void>(`/comentarios/${idComentario}`);
  }
}
