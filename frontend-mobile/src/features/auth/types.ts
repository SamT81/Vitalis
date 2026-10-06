import type { AuthUser, LoginRequest, Session } from '@ribas/shared';

export type { LoginRequest, Session } from '@ribas/shared';

/** Lo que expone useSession(). */
export interface SessionContextValue {
  user: AuthUser | null;
  token: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  /** true mientras se lee la sesión guardada al abrir la app. */
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<Session>;
  logout: () => Promise<void>;
}

/** Parámetros con los que se llega a la pantalla de Login (ver LOGIN_REASONS). */
export type LoginRouteParams = { reason?: string };
