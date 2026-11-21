import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { erroresPorCampo, mensajeError } from '../../../core/mensaje-error';
import { noSoloEspacios } from '../../../core/password.validators';
import { GENEROS, Genero } from '../../../models/genero';
import { PublicacionRequest } from '../../../models/publicacion';
import { AuthService } from '../../../services/auth.service';
import { PublicacionService } from '../../../services/publicacion.service';
import { ErrorCampoComponent } from '../../../shared/error-campo.component';
import { PortadaComponent } from '../../../shared/portada.component';

/** El año del libro no puede ser posterior al actual. */
function anioNoFuturo(control: AbstractControl): ValidationErrors | null {
  const anio = Number(control.value);
  return control.value && Number.isInteger(anio) && anio > new Date().getFullYear()
    ? { max: { max: new Date().getFullYear() } }
    : null;
}

// Crear (/resenas/nueva) y editar (/resenas/:id/editar) con el mismo formulario
@Component({
  selector: 'app-publicacion-form',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampoComponent, PortadaComponent],
  templateUrl: './publicacion-form.component.html',
})
export class PublicacionFormComponent {
  private readonly publicacionService = inject(PublicacionService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** :id de la ruta (solo al editar) */
  readonly id = input<string>();

  protected readonly generos = GENEROS;
  protected readonly minResena = 50;
  protected readonly maxResena = 1000;
  protected readonly invalido = ErrorCampoComponent.invalido;
  protected readonly editando = computed(() => !!this.id());
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly erroresServidor = signal<Record<string, string[]>>({});

  protected readonly form = inject(FormBuilder).nonNullable.group({
    titulo: ['', [Validators.required, noSoloEspacios, Validators.maxLength(100)]],
    autor: ['', [Validators.required, noSoloEspacios, Validators.maxLength(100)]],
    anioPublicacionLibro: ['', [Validators.required, Validators.pattern(/^\d{1,4}$/), anioNoFuturo]],
    genero: ['' as Genero | '', [Validators.required]],
    resena: ['', [Validators.required, noSoloEspacios, Validators.minLength(this.minResena), Validators.maxLength(this.maxResena)]],
  });

  // Vista previa de la portada mientras se escribe
  protected readonly vista = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.cargar(Number(id));
    });
  }

  private cargar(id: number): void {
    this.cargando.set(true);
    this.publicacionService.obtener(id).subscribe({
      next: p => {
        // Solo el autor puede editar (ni siquiera el ADMIN)
        if (p.usuarioId !== this.auth.usuario()?.id) {
          this.router.navigate(['/resenas', id]);
          return;
        }
        this.form.reset({
          titulo: p.titulo, autor: p.autor, anioPublicacionLibro: p.anioPublicacionLibro, genero: p.genero, resena: p.resena,
        });
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(mensajeError(err, 'No pudimos cargar la reseña.'));
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos: PublicacionRequest = {
      titulo: v.titulo.trim(),
      autor: v.autor.trim(),
      anioPublicacionLibro: v.anioPublicacionLibro.trim(),
      genero: v.genero as Genero,
      resena: v.resena.trim(),
    };
    this.guardando.set(true);
    this.error.set('');
    this.erroresServidor.set({});
    const id = this.id();
    const peticion = id ? this.publicacionService.actualizar(Number(id), datos) : this.publicacionService.crear(datos);
    peticion.subscribe({
      next: p => this.router.navigate(['/resenas', p.idPublicacion], { queryParams: { editada: 1 } }),
      error: (err: unknown) => {
        this.guardando.set(false);
        this.erroresServidor.set(erroresPorCampo(err));
        this.error.set(err instanceof HttpErrorResponse && err.status === 403
          ? (id ? 'Solo el autor puede editar esta reseña.' : 'Necesitas ser premium para publicar.')
          : mensajeError(err, 'Revisa los datos de la reseña.'));
      },
    });
  }
}
