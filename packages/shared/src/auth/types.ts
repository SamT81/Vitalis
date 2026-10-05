/** Contrato del DD · POST /api/v1/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  valid: boolean;
  userId: string;
  institutionId: string | null;
  roles: string[];
  token: string;
  expiresAt: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  roles: string[];
  institutionId: string | null;
  /** El contrato de login no lo trae; solo se conoce si otra fuente lo aporta. */
  institutionName: string | null;
}

/** Lo que se persiste (web: localStorage; móvil: expo-secure-store). */
export interface Session {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

/** Interfaz común de las implementaciones real (http) y simulada (mock). */
export interface AuthService {
  /** Resuelve con la sesión o rechaza con ApiError. */
  login(credentials: LoginRequest): Promise<Session>;
  logout(): Promise<void>;
  /** No revela si el correo existe. */
  forgotPassword(email: string): Promise<void>;
}
