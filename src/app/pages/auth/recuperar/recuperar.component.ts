import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { erroresPorCampo, mensajeError } from '../../../core/mensaje-error';
import { coincide, passwordSegura } from '../../../core/password.validators';
import { RecuperarResponse } from '../../../models/usuario';
import { AuthService } from '../../../services/auth.service';
import { ErrorCampoComponent } from '../../../shared/error-campo.component';
import { PasswordChecklistComponent } from '../../../shared/password-checklist.component';

type Paso = 'email' | 'codigo' | 'listo';

// Recuperacion en 2 pasos: 1) pedir codigo por email (simulado) 2) codigo + nueva contraseña
@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampoComponent, PasswordChecklistComponent],
  templateUrl: './recuperar.component.html',
})
export class RecuperarComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly invalido = ErrorCampoComponent.invalido;
  protected readonly paso = signal<Paso>('email');
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly erroresServidor = signal<Record<string, string[]>>({});
  protected readonly respuesta = signal<RecuperarResponse | null>(null);

  protected readonly formEmail = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
  });

  protected readonly formCodigo = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    nuevaPassword: ['', [Validators.required, passwordSegura]],
    confirmar: ['', [Validators.required]],
  }, { validators: coincide('nuevaPassword', 'confirmar') });

  solicitarCodigo(): void {
    if (this.formEmail.invalid) {
      this.formEmail.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    this.auth.recuperar(this.formEmail.getRawValue().email.trim()).subscribe({
      next: respuesta => {
        this.respuesta.set(respuesta);
        this.enviando.set(false);
        this.paso.set('codigo');
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        this.error.set(mensajeError(err));
      },
    });
  }

  restablecer(): void {
    if (this.formCodigo.invalid) {
      this.formCodigo.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    this.erroresServidor.set({});
    const { codigo, nuevaPassword } = this.formCodigo.getRawValue();
    this.auth.restablecer({ email: this.formEmail.getRawValue().email.trim(), codigo, nuevaPassword }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.paso.set('listo');
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        this.erroresServidor.set(erroresPorCampo(err));
        const codigoInvalido = err instanceof HttpErrorResponse && err.status === 400 && !Object.keys(erroresPorCampo(err)).length;
        this.error.set(codigoInvalido ? 'El código es incorrecto o ya expiró. Solicita uno nuevo.' : mensajeError(err));
      },
    });
  }

  volverAEmail(): void {
    this.paso.set('email');
    this.formCodigo.reset();
    this.error.set('');
  }
}
