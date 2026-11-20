import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../../services/auth.service';
import { sesionPrueba } from '../../../testing/datos-prueba';
import { configurarComponente } from '../../../testing/configurar';
import { PremiumComponent } from './premium.component';

describe('PremiumComponent', () => {
  it('confirma el pago simulado, muestra el comprobante y actualiza la sesión', async () => {
    const { fixture, http, el } = await configurarComponente(PremiumComponent);
    const auth = TestBed.inject(AuthService);
    auth.guardarSesion(sesionPrueba({ premium: false }));
    await fixture.whenStable();

    el.querySelector<HTMLButtonElement>('button.btn-acento')!.click();
    const req = http.expectOne('/pagos/premium');
    expect(req.request.body).toBeNull();
    req.flush({ pago: { id: 9, monto: 2000, fecha: '2026-11-20T10:00:00' }, sesion: sesionPrueba({ premium: true }) });
    await fixture.whenStable();

    expect(el.textContent).toContain('¡Pago realizado con éxito!');
    expect(el.textContent).toContain('#9');
    expect(auth.puedePublicar()).toBe(true);
  });

  it('si ya es premium no ofrece pagar', async () => {
    const { fixture, el } = await configurarComponente(PremiumComponent);
    TestBed.inject(AuthService).guardarSesion(sesionPrueba({ premium: true }));
    await fixture.whenStable();
    expect(el.textContent).toContain('Ya eres premium');
    expect(el.querySelector('button.btn-acento')).toBeNull();
  });
});
