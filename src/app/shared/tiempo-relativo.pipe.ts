import { Pipe, PipeTransform } from '@angular/core';

/** "hace 5 min", "hace 3 h", "hace 2 d" o la fecha si es mas antiguo que una semana. */
@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string | Date | null | undefined, ahora: number = Date.now()): string {
    if (!fecha) return '';
    const momento = new Date(fecha).getTime();
    if (Number.isNaN(momento)) return '';
    const minutos = Math.max(0, Math.floor((ahora - momento) / 60000));
    if (minutos < 1) return 'recién';
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return `hace ${dias} d`;
    return new Date(momento).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
