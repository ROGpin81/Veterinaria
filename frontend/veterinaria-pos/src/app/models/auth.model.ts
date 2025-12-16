export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: { id_usuario: number; nombre: string; correo: string };
}
