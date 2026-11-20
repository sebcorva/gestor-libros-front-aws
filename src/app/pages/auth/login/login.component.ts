import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { mensajeError } from '../../../core/mensaje-error';
import { AuthService } from '../../../services/auth.service';
import { ErrorCampoComponent } from '../../../shared/error-campo.component';
import { LogoComponent } from '../../../shared/logo.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampoComponent, LogoComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Query params (withComponentInputBinding)
  readonly returnUrl = input<string>();
  readonly sesion = input<string>();
  readonly registrado = input<string>();
  readonly restablecida = input<string>();

  protected readonly invalido = ErrorCampoComponent.invalido;
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly verPassword = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.maxLength(72)]],
  });

  ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login({ email: email.trim(), password }).subscribe({
      next: () => this.router.navigateByUrl(this.destinoSeguro()),
      error: (err: unknown) => {
        this.enviando.set(false);
        this.error.set(err instanceof HttpErrorResponse && err.status === 401
          ? 'Email o contraseña incorrectos.'
          : mensajeError(err));
      },
    });
  }

  /** Solo rutas internas (evita redirecciones a otros sitios). */
  private destinoSeguro(): string {
    const url = this.returnUrl();
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/';
  }
}
