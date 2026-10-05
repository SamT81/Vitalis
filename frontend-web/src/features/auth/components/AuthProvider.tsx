import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUnauthorizedHandler } from '@/api/httpClient';
import { authService } from './index';
import { clearSession, loadSession, saveSession } from './sessionStore';
import type { AuthUser, LoginRequest, Session } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<Session>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** setTimeout no admite esperas mayores a ~24,8 días. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restaura la sesión al abrir la app; loadSession descarta la que ya venció.
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const navigate = useNavigate();

  const dropSession = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const next = await authService.login(credentials);
    saveSession(next);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    dropSession();
    await authService.logout();
  }, [dropSession]);

  // Cierra la sesión en el momento en que vence.
  useEffect(() => {
    if (!session) return;
    const remaining = Date.parse(session.expiresAt) - Date.now();
    const timer = setTimeout(dropSession, Math.min(Math.max(remaining, 0), MAX_TIMEOUT_MS));
    return () => clearTimeout(timer);
  }, [session, dropSession]);

  // 401 del backend en una petición autenticada: cerrar sesión e ir a Login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      dropSession();
      navigate('/login', { replace: true, state: { reason: 'expired' } });
    });
    return () => setUnauthorizedHandler(null);
  }, [dropSession, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      expiresAt: session?.expiresAt ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return context;
}
