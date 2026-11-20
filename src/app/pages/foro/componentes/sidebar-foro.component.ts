import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GENEROS, InfoGenero } from '../../../models/genero';
import { Publicacion } from '../../../models/publicacion';
import { PublicacionService } from '../../../services/publicacion.service';
import { AvatarComponent } from '../../../shared/avatar.component';
import { PortadaComponent } from '../../../shared/portada.component';
import { TiempoRelativoPipe } from '../../../shared/tiempo-relativo.pipe';

// Columna derecha del mockup: generos populares, libros destacados y actividad reciente
@Component({
  selector: 'app-sidebar-foro',
  imports: [RouterLink, AvatarComponent, PortadaComponent, TiempoRelativoPipe],
  template: `
    <div class="d-flex flex-column gap-4 sticky-md-top lateral">
      <section class="tarjeta p-3 p-md-4" aria-labelledby="t-generos">
        <h2 id="t-generos" class="titulo-seccion">Géneros populares</h2>
        <div class="d-flex flex-wrap gap-2">
          @for (g of populares(); track g.info.codigo) {
            <a class="chip" [routerLink]="['/categoria', g.info.codigo]">
              <i class="bi {{ g.info.icono }}"></i>{{ g.info.nombre }}
              @if (g.cantidad) { <span class="badge rounded-pill text-bg-secondary">{{ g.cantidad }}</span> }
            </a>
          }
        </div>
      </section>

      <section class="tarjeta p-3 p-md-4" aria-labelledby="t-destacados">
        <h2 id="t-destacados" class="titulo-seccion">Libros destacados</h2>
        <div class="row row-cols-2 g-2">
          @for (p of destacados(); track p.idPublicacion) {
            <div class="col">
              <a [routerLink]="['/publicaciones', p.idPublicacion]" [attr.aria-label]="p.titulo + ' de ' + p.autor">
                <app-portada [titulo]="p.titulo" [autor]="p.autor" [genero]="p.genero" [mini]="true" />
              </a>
            </div>
          } @empty {
            <p class="small texto-suave mb-0">Aún no hay reseñas.</p>
          }
        </div>
      </section>

      <section class="tarjeta p-3 p-md-4" aria-labelledby="t-actividad">
        <h2 id="t-actividad" class="titulo-seccion">Actividad reciente</h2>
        @for (p of recientes(); track p.idPublicacion) {
          <a [routerLink]="['/publicaciones', p.idPublicacion]" class="d-flex gap-2 mb-3 text-decoration-none text-reset">
            <app-avatar [nombre]="p.usuarioNombre" [tamano]="32" />
            <div class="small lh-sm">
              <strong>{{ p.usuarioNombre }}</strong>
              <span class="texto-suave"> · {{ p.fechaPublicacion | tiempoRelativo }}</span>
              <div>recomendó «{{ p.titulo }}»</div>
            </div>
          </a>
        } @empty {
          <p class="small texto-suave mb-0">Sin actividad todavía.</p>
        }
      </section>
    </div>
  `,
  styles: `.lateral { top: 5.5rem; z-index: 1; }`,
})
export class SidebarForoComponent implements OnInit {
  private readonly publicacionService = inject(PublicacionService);
  private readonly publicaciones = signal<Publicacion[]>([]);

  /** Generos ordenados por cantidad de publicaciones (los 6 primeros). */
  readonly populares = computed<{ info: InfoGenero; cantidad: number }[]>(() => {
    const conteo = new Map<string, number>();
    for (const p of this.publicaciones()) conteo.set(p.genero, (conteo.get(p.genero) ?? 0) + 1);
    return GENEROS
      .map(info => ({ info, cantidad: conteo.get(info.codigo) ?? 0 }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 6);
  });

  // El backend ya las entrega de la mas nueva a la mas antigua
  readonly destacados = computed(() => this.publicaciones().slice(0, 4));
  readonly recientes = computed(() => this.publicaciones().slice(0, 5));

  ngOnInit(): void {
    this.publicacionService.listar().subscribe({
      next: lista => this.publicaciones.set(lista),
      error: () => this.publicaciones.set([]),
    });
  }
}
