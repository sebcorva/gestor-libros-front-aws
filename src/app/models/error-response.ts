// Formato de error comun a los dos microservicios
export interface ErrorResponse {
  status: number;
  mensaje: string;
  detalles: string[];
  timestamp: string;
}
