import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { mensajeError } from '../../../core/mensaje-error';
import { noSoloEspacios } from '../../../core/password.validators';
import { Comentario } from '../../../models/comentario';
import { infoGenero } from '../../../models/genero';
import { Publicacion } from '../../../models/publicacion';
import { AuthService } from '../../../services/auth.service';
import { ComentarioService } from '../../../services/comentario.service';
import { PublicacionService } from '../../../services/publicacion.service';
import { AvatarComponent } from '../../../shared/avatar.component';
import { ConfirmacionComponent } from '../../../shared/confirmacion.component';
import { ErrorCampoComponent } from '../../../shared/error-campo.component';
import { PortadaComponent } from '../../../shared/portada.component';
import { TiempoRelativoPipe } from '../../../shared/tiempo-relativo.pipe';
import { SidebarForoComponent } from '../componentes/sidebar-foro.component';

type Eliminacion = { tipo: 'publicacion' } | { tipo: 'comentario'; comentario: Comentario };

@Component({
  selector: 'app-publicacion-detalle',
  imports: [
    ReactiveFormsModule, RouterLink, DatePipe, AvatarComponent, PortadaComponent, TiempoRelativoPipe,
    ConfirmacionComponent, ErrorCampoComponent, SidebarForoComponent,
  ],
  templateUrl: './publicacion-detalle.component.html',
  styleUrl: './publicacion-detalle.component.css',
})
export class PublicacionDetalleComponent {
  private readonly publicacionService = inject(PublicacionService);
  private readonly comentarioService = inject(ComentarioService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  /** :id de la ruta */
  readonly id = input('');
  readonly editada = input<string>();

  protected readonly maxComentario = 500;
  protected readonly invalido = ErrorCampoComponent.invalido;
  protected readonly publicacion = signal<Publicacion | null>(null);
  protected readonly comentarios = signal<Comentario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly errorAccion = signal('');
  protected readonly comentando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly porEliminar = signal<Eliminacion | null>(null);

  protected readonly genero = computed(() => infoGenero(this.publicacion()?.genero));
  protected readonly esAutor = computed(() => this.auth.usuario()?.id === this.publicacion()?.usuarioId);
  // Moderacion: el ADMIN puede eliminar cualquier publicacion o comentario
  protected readonly puedeEliminar = computed(() => this.esAutor() || this.auth.esAdmin());
  protected readonly urlActual = computed(() => `/publicaciones/${this.id()}`);

  protected readonly formComentario = inject(FormBuilder).nonNullable.group({
    contenido: ['', [Validators.required, noSoloEspacios, Validators.maxLength(this.maxComentario)]],
  });

  constructor() {
    effect(() => this.cargar(this.id()));
  }

  cargar(idTexto: string): void {
    const id = Number(idTexto);
    this.cargando.set(true);
    this.error.set('');
    if (!Number.isInteger(id) || id < 1) {
      this.error.set('Esta reseña no existe.');
      this.cargando.set(false);
      return;
    }
    this.publicacionService.obtener(id).subscribe({
      next: p => {
        this.publicacion.set(p);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpErrorResponse && err.status === 404
          ? 'Esta reseña no existe o fue eliminada.'
          : mensajeError(err, 'No pudimos cargar la reseña.'));
        this.cargando.set(false);
      },
    });
    this.comentarioService.listar(id).subscribe({
      next: lista => this.comentarios.set(lista),
      error: () => this.comentarios.set([]),
    });
  }

  puedeEliminarComentario(c: Comentario): boolean {
    return this.auth.esAdmin() || this.auth.usuario()?.id === c.usuarioId;
  }

  comentar(): void {
    const p = this.publicacion();
    if (!p) return;
    if (this.formComentario.invalid) {
      this.formComentario.markAllAsTouched();
      return;
    }
    this.comentando.set(true);
    this.errorAccion.set('');
    this.comentarioService.crear(p.idPublicacion, this.formComentario.getRawValue().contenido.trim()).subscribe({
      next: nuevo => {
        this.comentarios.update(lista => [...lista, nuevo]);
        this.formComentario.reset();
        this.comentando.set(false);
      },
      error: (err: unknown) => {
        this.comentando.set(false);
        this.errorAccion.set(mensajeError(err, 'No pudimos publicar tu comentario.'));
      },
    });
  }

  confirmarEliminacion(): void {
    const objetivo = this.porEliminar();
    const p = this.publicacion();
    if (!objetivo || !p) return;
    this.eliminando.set(true);
    this.errorAccion.set('');
    const peticion = objetivo.tipo === 'publicacion'
      ? this.publicacionService.eliminar(p.idPublicacion)
      : this.comentarioService.eliminar(objetivo.comentario.idComentario);

    peticion.subscribe({
      next: () => {
        this.eliminando.set(false);
        this.porEliminar.set(null);
        if (objetivo.tipo === 'publicacion') {
          this.router.navigate(['/'], { queryParams: {} });
        } else {
          this.comentarios.update(lista => lista.filter(c => c.idComentario !== objetivo.comentario.idComentario));
        }
      },
      error: (err: unknown) => {
        this.eliminando.set(false);
        this.porEliminar.set(null);
        this.errorAccion.set(mensajeError(err, 'No pudimos eliminar.'));
      },
    });
  }
}
