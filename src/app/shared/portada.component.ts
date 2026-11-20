import { Component, computed, input } from '@angular/core';

import { infoGenero } from '../models/genero';

// La API no guarda imagenes: la portada se genera con el color del genero, el titulo y el autor
@Component({
  selector: 'app-portada',
  template: `
    <div class="portada" [class.mini]="mini()" [style.background]="fondo()" role="img"
         [attr.aria-label]="'Portada de ' + titulo()">
      <i class="bi {{ genero()?.icono ?? 'bi-book' }} icono"></i>
      <div class="titulo">{{ titulo() }}</div>
      @if (!mini()) {
        <div class="autor">{{ autor() }}</div>
      }
    </div>
  `,
  styles: `
    .portada {
      position: relative; aspect-ratio: 16 / 7; border-radius: 0.75rem; color: #fff; overflow: hidden;
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      text-align: center; padding: 1.25rem; gap: 0.35rem;
    }
    .portada.mini { aspect-ratio: 2 / 3; padding: 0.6rem; border-radius: 0.5rem; }
    .titulo { font-family: Georgia, serif; font-weight: 700; font-size: clamp(1.1rem, 3vw, 1.7rem); line-height: 1.15; }
    .mini .titulo { font-size: 0.8rem; }
    .autor { opacity: 0.85; font-size: 0.95rem; }
    .icono { position: absolute; right: 0.9rem; bottom: 0.4rem; font-size: 3.5rem; opacity: 0.18; }
    .mini .icono { font-size: 1.8rem; right: 0.4rem; bottom: 0.1rem; }
  `,
})
export class PortadaComponent {
  readonly titulo = input.required<string>();
  readonly autor = input('');
  readonly codigoGenero = input<string>('', { alias: 'genero' });
  readonly mini = input(false);

  readonly genero = computed(() => infoGenero(this.codigoGenero()));
  readonly fondo = computed(() => {
    const color = this.genero()?.color ?? '#2c6e91';
    return `linear-gradient(135deg, ${color} 0%, ${color}cc 60%, #1e2833 140%)`;
  });
}
