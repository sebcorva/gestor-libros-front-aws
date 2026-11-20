export type Rol = 'ADMIN' | 'USUARIO';

// Igual al UsuarioResponse de auth-users
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
  premium: boolean;
  fechaRegistro: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuario: Usuario;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

// POST /usuarios (password obligatoria) y PUT /usuarios/{id} (password opcional)
export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  rol?: Rol;
}

export interface RecuperarResponse {
  mensaje: string;
  codigoDemo: string | null;
  minutosVigencia: number;
}

export interface RestablecerRequest {
  email: string;
  codigo: string;
  nuevaPassword: string;
}
