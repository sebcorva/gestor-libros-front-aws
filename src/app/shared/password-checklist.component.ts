import { Component, computed, input } from '@angular/core';

import { REGLAS_PASSWORD } from '../core/password.validators';

// Checklist en vivo de las 6 reglas: cada una se pone verde al cumplirse
@Component({
  selector: 'app-password-checklist',
  template: `
    <ul class="list-unstyled small mb-0 mt-2 row row-cols-1 row-cols-sm-2 g-1" aria-live="polite">
      @for (regla of reglas(); track regla.mensaje) {
        <li class="col" [class.text-success]="regla.cumple" [class.texto-suave]="!regla.cumple">
          <i class="bi" [class.bi-check-circle-fill]="regla.cumple" [class.bi-circle]="!regla.cumple"></i>
          {{ regla.mensaje }}
          <span class="visually-hidden">{{ regla.cumple ? '(cumple)' : '(pendiente)' }}</span>
        </li>
      }
    </ul>
  `,
})
export class PasswordChecklistComponent {
  readonly valor = input<string | null | undefined>('');
  readonly reglas = computed(() =>
    REGLAS_PASSWORD.map(r => ({ mensaje: r.mensaje, cumple: r.cumple(this.valor() ?? '') }))
  );
}
