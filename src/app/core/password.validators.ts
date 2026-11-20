import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface ReglaPassword {
  clave: string;
  mensaje: string;
  cumple: (valor: string) => boolean;
}

// Las mismas 6 reglas que @PasswordSegura en auth-users
export const REGLAS_PASSWORD: readonly ReglaPassword[] = [
  { clave: 'minimo', mensaje: 'Al menos 8 caracteres', cumple: v => v.length >= 8 },
  { clave: 'maximo', mensaje: 'Máximo 20 caracteres', cumple: v => v.length <= 20 },
  { clave: 'mayusMinus', mensaje: 'Mayúsculas y minúsculas', cumple: v => /\p{Lu}/u.test(v) && /\p{Ll}/u.test(v) },
  { clave: 'numero', mensaje: 'Al menos un número', cumple: v => /\d/.test(v) },
  { clave: 'especial', mensaje: 'Al menos un carácter especial', cumple: v => /[^\p{L}\p{N}\s]/u.test(v) },
  { clave: 'sinEspacios', mensaje: 'Sin espacios', cumple: v => !/\s/.test(v) },
];

/** Devuelve { passwordSegura: [mensajes incumplidos] }. Un valor vacio es valido (usar required aparte). */
export const passwordSegura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = (control.value ?? '') as string;
  if (valor === '') return null;
  const incumplidas = REGLAS_PASSWORD.filter(r => !r.cumple(valor)).map(r => r.mensaje);
  return incumplidas.length ? { passwordSegura: incumplidas } : null;
};

/** Validador de grupo: el campo `confirmar` debe ser igual a `campo`. El error queda en `confirmar`. */
export function coincide(campo: string, confirmar: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const original = grupo.get(campo);
    const copia = grupo.get(confirmar);
    if (!original || !copia) return null;
    const errores = { ...(copia.errors ?? {}) };
    if (copia.value && original.value !== copia.value) {
      errores['noCoincide'] = true;
    } else {
      delete errores['noCoincide'];
    }
    copia.setErrors(Object.keys(errores).length ? errores : null);
    return null;
  };
}

/** Rechaza textos con solo espacios (el backend usa @NotBlank). */
export const noSoloEspacios: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value;
  return typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0 ? { soloEspacios: true } : null;
};
