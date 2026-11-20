import { Component, input, output } from '@angular/core';

// Modal de confirmacion con las clases de Bootstrap, controlado por Angular (input `abierto`)
@Component({
  selector: 'app-confirmacion',
  template: `
    @if (abierto()) {
      <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" [attr.aria-labelledby]="'conf-titulo'"
           (keydown.escape)="cancelar.emit()">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title fs-5" id="conf-titulo">{{ titulo() }}</h2>
              <button type="button" class="btn-close" aria-label="Cerrar" (click)="cancelar.emit()"></button>
            </div>
            <div class="modal-body">{{ mensaje() }}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="cancelar.emit()" [disabled]="procesando()">
                Cancelar
              </button>
              <button type="button" class="btn btn-danger" (click)="confirmar.emit()" [disabled]="procesando()">
                @if (procesando()) { <span class="spinner-border spinner-border-sm me-1"></span> }
                {{ textoConfirmar() }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop show"></div>
    }
  `,
})
export class ConfirmacionComponent {
  readonly abierto = input(false);
  readonly titulo = input('¿Estás seguro?');
  readonly mensaje = input('');
  readonly textoConfirmar = input('Eliminar');
  readonly procesando = input(false);
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
