import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { mensajeError } from '../../../core/mensaje-error';
import { Rol, Usuario } from '../../../models/usuario';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { AvatarComponent } from '../../../shared/avatar.component';
import { ConfirmacionComponent } from '../../../shared/confirmacion.component';

@Component({
  selector: 'app-usuarios-lista',
  imports: [FormsModule, RouterLink, DatePipe, AvatarComponent, ConfirmacionComponent],
  templateUrl: './usuarios-lista.component.html',
})
export class UsuariosListaComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  protected readonly auth = inject(AuthService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly busqueda = signal('');
  protected readonly filtroRol = signal<Rol | ''>('');
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');
  protected readonly porEliminar = signal<Usuario | null>(null);
  protected readonly eliminando = signal(false);

  // Colecciones de Angular: busqueda y filtros en el cliente con computed()
  protected readonly visibles = computed(() => {
    const texto = this.busqueda().trim().toLocaleLowerCase();
    const rol = this.filtroRol();
    return this.usuarios()
      .filter(u => !rol || u.rol === rol)
      .filter(u => !texto || `${u.nombre} ${u.apellido} ${u.email}`.toLocaleLowerCase().includes(texto));
  });

  protected readonly resumen = computed(() => ({
    total: this.usuarios().length,
    admins: this.usuarios().filter(u => u.rol === 'ADMIN').length,
    premium: this.usuarios().filter(u => u.premium).length,
  }));

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.usuarioService.listar().subscribe({
      next: lista => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(mensajeError(err, 'No pudimos cargar los usuarios.'));
        this.cargando.set(false);
      },
    });
  }

  esYo(u: Usuario): boolean {
    return this.auth.usuario()?.id === u.id;
  }

  eliminar(): void {
    const usuario = this.porEliminar();
    if (!usuario) return;
    this.eliminando.set(true);
    this.usuarioService.eliminar(usuario.id).subscribe({
      next: () => {
        this.usuarios.update(lista => lista.filter(u => u.id !== usuario.id));
        this.aviso.set(`Se eliminó a ${usuario.nombre} ${usuario.apellido}.`);
        this.eliminando.set(false);
        this.porEliminar.set(null);
      },
      error: (err: unknown) => {
        this.error.set(mensajeError(err, 'No pudimos eliminar el usuario.'));
        this.eliminando.set(false);
        this.porEliminar.set(null);
      },
    });
  }
}
