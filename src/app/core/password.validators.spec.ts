import { FormControl, FormGroup } from '@angular/forms';

import { coincide, noSoloEspacios, passwordSegura } from './password.validators';

describe('passwordSegura', () => {
  const errores = (valor: string) => passwordSegura(new FormControl(valor))?.['passwordSegura'] as string[] | undefined;

  it.each(['Admin2026!', 'Premium2026!', 'aB3$efgh', 'Ñandú2026#'])('acepta %s', valor => {
    expect(errores(valor)).toBeUndefined();
  });

  it('un valor vacío es válido (lo controla required)', () => {
    expect(errores('')).toBeUndefined();
  });

  it.each([
    ['Ab1!xyz', 'Al menos 8 caracteres'],
    ['Ab1!xyzAb1!xyzAb1!xy1', 'Máximo 20 caracteres'],
    ['admin2026!', 'Mayúsculas y minúsculas'],
    ['AdminAdmin!', 'Al menos un número'],
    ['Admin20266', 'Al menos un carácter especial'],
    ['Admin 2026!', 'Sin espacios'],
  ])('%s incumple "%s"', (valor, regla) => {
    expect(errores(valor)).toContain(regla);
  });

  it('reporta todas las reglas incumplidas a la vez', () => {
    expect(errores('abc')).toHaveLength(4);
  });
});

describe('coincide', () => {
  it('marca noCoincide en el campo de confirmación', () => {
    const grupo = new FormGroup(
      { password: new FormControl('Admin2026!'), confirmar: new FormControl('Otra2026!') },
      { validators: coincide('password', 'confirmar') }
    );
    expect(grupo.get('confirmar')?.hasError('noCoincide')).toBe(true);

    grupo.get('confirmar')?.setValue('Admin2026!');
    expect(grupo.get('confirmar')?.hasError('noCoincide')).toBe(false);
  });
});

describe('noSoloEspacios', () => {
  it('rechaza solo espacios y acepta texto', () => {
    expect(noSoloEspacios(new FormControl('   '))).toEqual({ soloEspacios: true });
    expect(noSoloEspacios(new FormControl(' Ana '))).toBeNull();
  });
});
