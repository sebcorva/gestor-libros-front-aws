import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { infoGenero } from '../../../models/genero';
import { Publicacion } from '../../../models/publicacion';
import { AuthService } from '../../../services/auth.service';
import { AvatarComponent } from '../../../shared/avatar.component';
import { PortadaComponent } from '../../../shared/portada.component';
import { TiempoRelativoPipe } from '../../../shared/tiempo-relativo.pipe';

// Tarjeta del feed, como el mockup: titulo, autor del post, extracto, portada y genero/año
@Component({
  selector: 'app-publicacion-card',
  imports: [RouterLink, AvatarComponent, PortadaComponent, TiempoRelativoPipe],
  template: `
    <article class="tarjeta p-3 p-md-4">
      <h2 class="h5 fw-bold mb-3">
        <a [routerLink]="['/resenas', p().idPublicacion]" class="link-dark text-decoration-none stretched-titulo">
          Descubriendo “{{ p().titulo }}” de {{ p().autor }}
        </a>
      </h2>

      <div class="d-flex align-items-center gap-2 mb-2">
        <app-avatar [nombre]="p().usuarioNombre" [tamano]="34" />
        <div class="lh-sm flex-grow-1">
          <div class="fw-semibold">{{ p().usuarioNombre }}</div>
          <small class="texto-suave">{{ p().fechaPublicacion | tiempoRelativo }}</small>
        </div>
        <div class="dropdown">
          <button class="btn btn-sm btn-link text-secondary" type="button" data-bs-toggle="dropdown"
                  aria-expanded="false" aria-label="Opciones de la publicación">
            <i class="bi bi-three-dots fs-5"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" [routerLink]="['/resenas', p().idPublicacion]"><i class="bi bi-eye me-2"></i>Ver reseña</a></li>
            @if (esAutor()) {
              <li><a class="dropdown-item" [routerLink]="['/resenas', p().idPublicacion, 'editar']"><i class="bi bi-pencil me-2"></i>Editar</a></li>
            }
            <li><a class="dropdown-item" [routerLink]="['/categoria', p().genero]"><i class="bi bi-tag me-2"></i>Más de {{ genero()?.nombre }}</a></li>
          </ul>
        </div>
      </div>

      <p class="extracto mb-3">{{ p().resena }}</p>

      <a [routerLink]="['/resenas', p().idPublicacion]" class="d-block mb-3" tabindex="-1" aria-hidden="true">
        <app-portada [titulo]="p().titulo" [autor]="p().autor" [genero]="p().genero" />
      </a>

      <div class="d-flex flex-wrap align-items-center gap-2 small">
        <a [routerLink]="['/categoria', p().genero]" class="badge rounded-pill text-bg-light border text-decoration-none">
          <i class="bi {{ genero()?.icono }} me-1"></i>{{ genero()?.nombre }}
        </a>
        <span class="texto-suave"><i class="bi bi-calendar3 me-1"></i>Publicado en {{ p().anioPublicacionLibro }}</span>
        <a [routerLink]="['/resenas', p().idPublicacion]" class="ms-auto fw-semibold text-decoration-none">
          Leer y comentar <i class="bi bi-arrow-right"></i>
        </a>
      </div>
    </article>
  `,
  styles: `
    .extracto {
      display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }
    .stretched-titulo:hover { color: var(--lyl-primario) !important; }
  `,
})
export class PublicacionCardComponent {
  private readonly auth = inject(AuthService);
  readonly p = input.required<Publicacion>({ alias: 'publicacion' });
  readonly genero = computed(() => infoGenero(this.p().genero));
  readonly esAutor = computed(() => this.auth.usuario()?.id === this.p().usuarioId);
}
