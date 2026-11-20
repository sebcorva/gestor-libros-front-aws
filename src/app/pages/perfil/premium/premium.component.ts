import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { mensajeError } from '../../../core/mensaje-error';
import { Pago } from '../../../models/pago';
import { AuthService } from '../../../services/auth.service';
import { PagoService } from '../../../services/pago.service';

// Pago simulado: no se piden datos de tarjeta ni se usa un medio de pago real
@Component({
  selector: 'app-premium',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './premium.component.html',
})
export class PremiumComponent {
  private readonly pagoService = inject(PagoService);
  protected readonly auth = inject(AuthService);

  readonly motivo = input<string>();

  protected readonly precio = 2000;
  protected readonly procesando = signal(false);
  protected readonly error = signal('');
  protected readonly comprobante = signal<Pago | null>(null);

  protected readonly beneficios = [
    { icono: 'bi-pencil-square', texto: 'Publicar reseñas de tus libros favoritos' },
    { icono: 'bi-pencil', texto: 'Editar y eliminar tus propias reseñas' },
    { icono: 'bi-star-fill', texto: 'Insignia premium en tu perfil' },
    { icono: 'bi-heart', texto: 'Apoyar a la comunidad de Libros y Letras' },
  ];

  confirmarPago(): void {
    this.procesando.set(true);
    this.error.set('');
    this.pagoService.comprarPremium().subscribe({
      next: respuesta => {
        this.comprobante.set(respuesta.pago);
        this.procesando.set(false);
      },
      error: (err: unknown) => {
        this.procesando.set(false);
        this.error.set(err instanceof HttpErrorResponse && err.status === 409
          ? 'Tu cuenta ya es premium.'
          : mensajeError(err, 'No pudimos procesar el pago.'));
      },
    });
  }
}
