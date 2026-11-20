import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { Pago, PagoPremiumResponse } from '../models/pago';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  /** Pago simulado (sin datos de tarjeta). Reemplaza la sesion por el token nuevo con premium=true. */
  comprarPremium(): Observable<PagoPremiumResponse> {
    return this.http.post<PagoPremiumResponse>('/pagos/premium', null).pipe(
      tap(respuesta => this.auth.guardarSesion(respuesta.sesion))
    );
  }

  misPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>('/pagos');
  }
}
