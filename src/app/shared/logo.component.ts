import { Component, input } from '@angular/core';

// Logo propio de "Libros y Letras": libro abierto con lineas de texto
@Component({
  selector: 'app-logo',
  template: `
    <svg [attr.width]="tamano()" [attr.height]="tamano()" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="1.5" y="6" width="45" height="36" rx="5" stroke="currentColor" stroke-width="3" />
      <path d="M24 10v28" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <path d="M8 15h11M8 21h11M8 27h8M29 15h11M29 21h11M29 27h8" stroke="currentColor"
            stroke-width="2.6" stroke-linecap="round" />
      <path d="M8 34c5-2.5 11-2.5 16 0 5-2.5 11-2.5 16 0" stroke="#f2b01e" stroke-width="2.6"
            stroke-linecap="round" />
    </svg>
  `,
})
export class LogoComponent {
  readonly tamano = input(40);
}
