import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { erroresPorCampo, mensajeError } from '../../../core/mensaje-error';
import { coincide, noSoloEspacios, passwordSegura } from '../../../core/password.validators';
import { Rol, UsuarioRequest } from '../../../models/usuario';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { ErrorCampoComponent } from '../../../shared/error-campo.component';
import { PasswordChecklistComponent } from '../../../shared/password-checklist.component';

// ADMIN: crear (/admin/usuarios/nuevo) o editar (/admin/usuarios/:id/editar) un usuario, incluido su rol
@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampoComponent, PasswordChecklistComponent],
  templateUrl: './usuario-form.component.html',
})
export class UsuarioFormComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** :id de la ruta (solo al editar) */
  readonly id = input<string>();

  protected readonly invalido = ErrorCampoComponent.invalido;
  protected readonly editando = computed(() => !!this.id());
  protected readonly esYo = computed(() => !!this.id() && Number(this.id()) === this.auth.usuario()?.id);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly erroresServidor = signal<Record<string, string[]>>({});

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, noSoloEspacios, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, noSoloEspacios, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    rol: ['USUARIO' as Rol, [Validators.required]],
    password: ['', [passwordSegura]],
    confirmar: [''],
  }, { validators: coincide('password', 'confirmar') });

  constructor() {
    effect(() => {
      const id = this.id();
      const { password, confirmar, rol } = this.form.controls;
      if (id) {
        // Al editar la contraseña es opcional: si se deja vacia se conserva
        password.setValidators([passwordSegura]);
        confirmar.clearValidators();
        this.cargar(Number(id));
      } else {
        password.setValidators([Validators.required, passwordSegura]);
        confirmar.setValidators([Validators.required]);
      }
      password.updateValueAndValidity();
      confirmar.updateValueAndValidity();
      // Un admin no puede quitarse su propio rol
      if (this.esYo()) rol.disable(); else rol.enable();
    });
  }

  private cargar(id: number): void {
    this.cargando.set(true);
    this.usuarioService.obtener(id).subscribe({
      next: u => {
        this.form.patchValue({ nombre: u.nombre, apellido: u.apellido, email: u.email, rol: u.rol });
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(mensajeError(err, 'No pudimos cargar el usuario.'));
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos: UsuarioRequest = { nombre: v.nombre.trim(), apellido: v.apellido.trim(), email: v.email.trim(), rol: v.rol };
    if (v.password) datos.password = v.password;

    this.guardando.set(true);
    this.error.set('');
    this.erroresServidor.set({});
    const id = this.id();
    const peticion = id ? this.usuarioService.actualizar(Number(id), datos) : this.usuarioService.crear(datos);
    peticion.subscribe({
      next: usuario => {
        this.auth.actualizarUsuario(usuario);
        this.router.navigate(['/admin/usuarios']);
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        this.erroresServidor.set(erroresPorCampo(err));
        this.error.set(mensajeError(err, 'Revisa los datos del usuario.'));
      },
    });
  }
}
