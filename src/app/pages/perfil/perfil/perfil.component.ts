import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { erroresPorCampo, mensajeError } from '../../../core/mensaje-error';
import { coincide, noSoloEspacios, passwordSegura } from '../../../core/password.validators';
import { Pago } from '../../../models/pago';
import { Usuario } from '../../../models/usuario';
import { AuthService } from '../../../services/auth.service';
import { PagoService } from '../../../services/pago.service';
import { UsuarioService } from '../../../services/usuario.service';
import { AvatarComponent } from '../../../shared/avatar.component';
import { ErrorCampoComponent } from '../../../shared/error-campo.component';
import { PasswordChecklistComponent } from '../../../shared/password-checklist.component';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, CurrencyPipe, AvatarComponent, ErrorCampoComponent, PasswordChecklistComponent],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly pagoService = inject(PagoService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly invalido = ErrorCampoComponent.invalido;
  protected readonly usuario = signal<Usuario | null>(null);
  protected readonly pagos = signal<Pago[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal('');

  protected readonly guardandoDatos = signal(false);
  protected readonly mensajeDatos = signal<{ tipo: 'success' | 'danger'; texto: string } | null>(null);
  protected readonly erroresDatos = signal<Record<string, string[]>>({});

  protected readonly guardandoPassword = signal(false);
  protected readonly mensajePassword = signal<{ tipo: 'success' | 'danger'; texto: string } | null>(null);
  protected readonly erroresPassword = signal<Record<string, string[]>>({});

  protected readonly formDatos = this.fb.group({
    nombre: ['', [Validators.required, noSoloEspacios, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, noSoloEspacios, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
  });

  protected readonly formPassword = this.fb.group({
    password: ['', [Validators.required, passwordSegura]],
    confirmar: ['', [Validators.required]],
  }, { validators: coincide('password', 'confirmar') });

  ngOnInit(): void {
    this.usuarioService.me().subscribe({
      next: usuario => {
        this.usuario.set(usuario);
        this.formDatos.reset({ nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email });
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.errorCarga.set(mensajeError(err, 'No pudimos cargar tu perfil.'));
        this.cargando.set(false);
      },
    });
    this.pagoService.misPagos().subscribe({ next: pagos => this.pagos.set(pagos), error: () => this.pagos.set([]) });
  }

  guardarDatos(): void {
    const usuario = this.usuario();
    if (!usuario) return;
    if (this.formDatos.invalid) {
      this.formDatos.markAllAsTouched();
      return;
    }
    const { nombre, apellido, email } = this.formDatos.getRawValue();
    this.guardandoDatos.set(true);
    this.mensajeDatos.set(null);
    this.erroresDatos.set({});
    // Sin password: el backend conserva la actual
    this.usuarioService.actualizar(usuario.id, { nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim() }).subscribe({
      next: actualizado => {
        this.usuario.set(actualizado);
        this.auth.actualizarUsuario(actualizado);
        this.formDatos.markAsPristine();
        this.guardandoDatos.set(false);
        this.mensajeDatos.set({ tipo: 'success', texto: 'Tus datos fueron actualizados.' });
      },
      error: (err: unknown) => {
        this.guardandoDatos.set(false);
        this.erroresDatos.set(erroresPorCampo(err));
        this.mensajeDatos.set({ tipo: 'danger', texto: mensajeError(err, 'Revisa los datos ingresados.') });
      },
    });
  }

  cambiarPassword(): void {
    const usuario = this.usuario();
    if (!usuario) return;
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }
    this.guardandoPassword.set(true);
    this.mensajePassword.set(null);
    this.erroresPassword.set({});
    const { password } = this.formPassword.getRawValue();
    this.usuarioService.actualizar(usuario.id, {
      nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, password,
    }).subscribe({
      next: () => {
        this.formPassword.reset();
        this.guardandoPassword.set(false);
        this.mensajePassword.set({ tipo: 'success', texto: 'Tu contraseña fue cambiada.' });
      },
      error: (err: unknown) => {
        this.guardandoPassword.set(false);
        this.erroresPassword.set(erroresPorCampo(err));
        this.mensajePassword.set({ tipo: 'danger', texto: mensajeError(err, 'No pudimos cambiar la contraseña.') });
      },
    });
  }
}
