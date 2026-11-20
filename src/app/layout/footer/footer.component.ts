import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LogoComponent],
  template: `
    <footer class="pie mt-auto py-4">
      <div class="container-xl">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-6 d-flex align-items-center gap-2">
            <app-logo [tamano]="28" />
            <span><strong>Libros y Letras</strong> · Foro de recomendaciones de libros</span>
          </div>
          <div class="col-12 col-md-6 text-md-end small">
            <a routerLink="/">Foro</a> · <a routerLink="/registro">Únete</a> ·
            <span class="opacity-75">Proyecto académico DSY2205 · {{ anio }}</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .pie { background: var(--lyl-navbar); color: #cfd6de; }
    a { color: #fff; text-decoration: none; }
    a:hover { text-decoration: underline; }
  `,
})
export class FooterComponent {
  protected readonly anio = new Date().getFullYear();
}
