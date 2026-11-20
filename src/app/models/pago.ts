import { LoginResponse } from './usuario';

export interface Pago {
  id: number;
  monto: number;
  fecha: string;
}

// Comprobante + sesion nueva: el token anterior aun dice premium=false
export interface PagoPremiumResponse {
  pago: Pago;
  sesion: LoginResponse;
}
