import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { GENEROS } from '../../models/genero';
import { AuthService } from '../../services/auth.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, RouterLink, RouterLinkActive, AvatarComponent, LogoComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly generos = GENEROS;
  protected readonly menuAbierto = signal(false);
  protected busqueda = '';

  constructor() {
    // En movil, el menu se cierra solo al navegar
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.menuAbierto.set(false));
  }

  buscar(): void {
    const q = this.busqueda.trim();
    this.router.navigate(['/'], { queryParams: q ? { q } : {} });
  }

  salir(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
