import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { erroresPorCampo, mensajeError } from '../../../core/mensaje-error';
import { coincide, noSoloEspacios, passwordSegura } from '../../../core/password.validators';
import { AuthService } from '../../../services/auth.service';
import { ErrorCampoComponent } from '../../../shared/error-campo.component';
import { PasswordChecklistComponent } from '../../../shared/password-checklist.component';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampoComponent, PasswordChecklistComponent],
  templateUrl: './registro.component.html',
})
export class RegistroComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly invalido = ErrorCampoComponent.invalido;
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly erroresServidor = signal<Record<string, string[]>>({});

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, noSoloEspacios, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, noSoloEspacios, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, passwordSegura]],
    confirmar: ['', [Validators.required]],
    terminos: [false, [Validators.requiredTrue]],
  }, { validators: coincide('password', 'confirmar') });

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    this.erroresServidor.set({});
    const { nombre, apellido, email, password } = this.form.getRawValue();
    const datos = { nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim(), password };

    // Registro y login automatico
    this.auth.registro(datos).pipe(
      switchMap(() => this.auth.login({ email: datos.email, password }))
    ).subscribe({
      next: () => this.router.navigate(['/'], { queryParams: { bienvenida: 1 } }),
      error: (err: unknown) => {
        this.enviando.set(false);
        this.erroresServidor.set(erroresPorCampo(err));
        this.error.set(mensajeError(err, 'Revisa los datos ingresados.'));
      },
    });
  }
}
