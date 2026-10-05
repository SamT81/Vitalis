import type { LoginRequest, Session } from './types';

/** Interfaz común de las implementaciones real (http) y simulada (mock). */
export interface AuthService {
  /** Resuelve con la sesión o rechaza con ApiError. */
  login(credentials: LoginRequest): Promise<Session>;
  logout(): Promise<void>;
  /** No revela si el correo existe. */
  forgotPassword(email: string): Promise<void>;
}
