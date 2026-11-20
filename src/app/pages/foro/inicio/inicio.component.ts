import { Component, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { mensajeError } from '../../../core/mensaje-error';
import { Publicacion } from '../../../models/publicacion';
import { AuthService } from '../../../services/auth.service';
import { PublicacionService } from '../../../services/publicacion.service';
import { AvatarComponent } from '../../../shared/avatar.component';
import { PublicacionCardComponent } from '../componentes/publicacion-card.component';
import { SidebarForoComponent } from '../componentes/sidebar-foro.component';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, AvatarComponent, PublicacionCardComponent, SidebarForoComponent],
  templateUrl: './inicio.component.html',
})
export class InicioComponent {
  private readonly publicacionService = inject(PublicacionService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  // Query params (?q= busqueda, ?bienvenida=1 tras registrarse)
  readonly q = input<string>();
  readonly bienvenida = input<string>();

  protected readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  constructor() {
    // Observer: cada vez que cambia ?q= se vuelve a consultar la API
    effect(() => this.cargar(this.q()));
  }

  cargar(q?: string): void {
    this.cargando.set(true);
    this.error.set('');
    this.publicacionService.listar(q).subscribe({
      next: lista => {
        this.publicaciones.set(lista);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(mensajeError(err, 'No pudimos cargar las publicaciones.'));
        this.cargando.set(false);
      },
    });
  }

  limpiarBusqueda(): void {
    this.router.navigate(['/']);
  }
}
