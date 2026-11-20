import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';

import { ALMACENAMIENTO } from '../services/auth.service';
import { StorageMemoria } from './datos-prueba';

/** TestBed comun: router, HttpClient de prueba y storage en memoria. */
export async function configurarComponente<T>(componente: Type<T>) {
  await TestBed.configureTestingModule({
    imports: [componente],
    providers: [
      provideRouter([], withComponentInputBinding()),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ALMACENAMIENTO, useValue: new StorageMemoria() },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(componente);
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate').mockResolvedValue(true);
  vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  await fixture.whenStable();
  return { fixture, http: TestBed.inject(HttpTestingController), router, el: fixture.nativeElement as HTMLElement };
}

/** Escribe en un input y dispara el evento para que el formulario lo lea. */
export function escribir(el: HTMLElement, selector: string, valor: string): void {
  const input = el.querySelector<HTMLInputElement>(selector);
  if (!input) throw new Error(`No existe ${selector}`);
  input.value = valor;
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('blur'));
}

export function enviar(el: HTMLElement): void {
  el.querySelector('form')?.dispatchEvent(new Event('submit'));
}
