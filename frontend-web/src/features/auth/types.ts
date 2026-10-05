import type { AuthUser, LoginRequest, Session } from '@ribas/shared';

export type { LoginRequest, Session } from '@ribas/shared';

/** Lo que expone useSession(). */
export interface SessionContextValue {
  user: AuthUser | null;
  token: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<Session>;
  logout: () => Promise<void>;
}

/** Estado de navegación con el que se llega a Login. */
export interface LoginLocationState {
  /** Ruta protegida que se intentó abrir sin sesión. */
  from?: string;
  reason?: 'expired';
}
