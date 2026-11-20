import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { mensajeError } from '../../../core/mensaje-error';
import { GENEROS, infoGenero } from '../../../models/genero';
import { Publicacion } from '../../../models/publicacion';
import { PublicacionService } from '../../../services/publicacion.service';
import { PublicacionCardComponent } from '../componentes/publicacion-card.component';
import { SidebarForoComponent } from '../componentes/sidebar-foro.component';

@Component({
  selector: 'app-categoria',
  imports: [FormsModule, RouterLink, PublicacionCardComponent, SidebarForoComponent],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css',
})
export class CategoriaComponent implements OnInit {
  private readonly publicacionService = inject(PublicacionService);

  /** :genero de la ruta */
  readonly genero = input('');

  protected readonly generos = GENEROS;
  protected readonly info = computed(() => infoGenero(this.genero()));
  protected readonly todas = signal<Publicacion[]>([]);
  protected readonly filtro = signal('');
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  // Colecciones de Angular: se filtra en el cliente por genero y por texto
  protected readonly delGenero = computed(() => this.todas().filter(p => p.genero === this.genero()));
  protected readonly visibles = computed(() => {
    const texto = this.filtro().trim().toLocaleLowerCase();
    if (!texto) return this.delGenero();
    return this.delGenero().filter(p => `${p.titulo} ${p.autor}`.toLocaleLowerCase().includes(texto));
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.publicacionService.listar().subscribe({
      next: lista => {
        this.todas.set(lista);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(mensajeError(err, 'No pudimos cargar las publicaciones.'));
        this.cargando.set(false);
      },
    });
  }
}
