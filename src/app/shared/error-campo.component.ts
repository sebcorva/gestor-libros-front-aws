import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Muestra los errores de un campo (validaciones del cliente y, si llegan, las del servidor).
 * Se usa debajo de cada input con la clase `is-invalid` de Bootstrap.
 */
@Component({
  selector: 'app-error-campo',
  template: `
    @for (mensaje of calcular(); track mensaje) {
      <div class="invalid-feedback d-block">{{ mensaje }}</div>
    }
  `,
})
export class ErrorCampoComponent {
  readonly control = input.required<AbstractControl | null>();
  readonly servidor = input<string[] | undefined>([]);
  /** Texto para el error `pattern` (cada campo tiene su formato). */
  readonly mensajePatron = input('El formato no es válido');

  // Metodo (no computed): el estado de un AbstractControl no es un signal, se lee en cada deteccion de cambios
  calcular(): string[] {
    const servidor = this.servidor() ?? [];
    const control = this.control();
    if (!control || !(control.touched || control.dirty) || !control.errors) return servidor;
    const e = control.errors;
    const mensajes: string[] = [];
    if (e['required']) mensajes.push('Este campo es obligatorio');
    if (e['email']) mensajes.push('Ingresa un email válido');
    if (e['soloEspacios']) mensajes.push('No puede contener solo espacios');
    if (e['maxlength']) mensajes.push(`Máximo ${e['maxlength'].requiredLength} caracteres`);
    if (e['minlength']) mensajes.push(`Mínimo ${e['minlength'].requiredLength} caracteres`);
    if (e['pattern']) mensajes.push(this.mensajePatron());
    if (e['min']) mensajes.push(`Debe ser mayor o igual a ${e['min'].min}`);
    if (e['max']) mensajes.push(`Debe ser menor o igual a ${e['max'].max}`);
    if (e['noCoincide']) mensajes.push('Las contraseñas no coinciden');
    if (e['passwordSegura']) mensajes.push('La contraseña no cumple todos los requisitos');
    return [...mensajes, ...servidor];
  }

  /** true si hay que marcar el input con `is-invalid`. */
  static invalido(control: AbstractControl | null, servidor?: string[]): boolean {
    return !!servidor?.length || !!control && control.invalid && (control.touched || control.dirty);
  }
}
