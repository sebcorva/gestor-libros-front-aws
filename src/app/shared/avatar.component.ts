import { Component, computed, input } from '@angular/core';

const COLORES = ['#2c6e91', '#8b1e3f', '#3a7d44', '#6a4c93', '#c0507a', '#d68c1e', '#1b6b73', '#5c677d'];

// La API no guarda fotos: el avatar es un circulo con las iniciales y un color fijo por nombre
@Component({
  selector: 'app-avatar',
  template: `
    <span class="avatar rounded-circle d-inline-flex align-items-center justify-content-center fw-semibold text-white"
          [style.width.px]="tamano()" [style.height.px]="tamano()" [style.font-size.px]="tamano() * 0.4"
          [style.background]="color()" [attr.title]="nombre()" aria-hidden="true">
      {{ iniciales() }}
    </span>
  `,
  styles: `.avatar { flex-shrink: 0; letter-spacing: 0.02em; user-select: none; }`,
})
export class AvatarComponent {
  readonly nombre = input.required<string>();
  readonly tamano = input(36);

  readonly iniciales = computed(() =>
    this.nombre().trim().split(/\s+/).slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('') || '?'
  );

  readonly color = computed(() => {
    let hash = 0;
    for (const c of this.nombre()) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
    return COLORES[hash % COLORES.length];
  });
}
