import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Publicacion, PublicacionRequest } from '../models/publicacion';

// MVC - Modelo: publicaciones de gestor-biblioteca. Observer: cada metodo devuelve un Observable.
@Injectable({ providedIn: 'root' })
export class PublicacionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/publicaciones';

  /** Todas (de la mas nueva a la mas antigua) o las que contienen `q` en el titulo o el autor. */
  listar(q?: string): Observable<Publicacion[]> {
    const texto = q?.trim();
    const params = texto ? new HttpParams().set('q', texto) : undefined;
    return this.http.get<Publicacion[]>(this.apiUrl, { params });
  }

  obtener(id: number): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.apiUrl}/${id}`);
  }

  crear(publicacion: PublicacionRequest): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.apiUrl, publicacion);
  }

  actualizar(id: number, publicacion: PublicacionRequest): Observable<Publicacion> {
    return this.http.put<Publicacion>(`${this.apiUrl}/${id}`, publicacion);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
