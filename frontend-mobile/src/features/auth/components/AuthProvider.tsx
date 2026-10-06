import { isExpired, LOGIN_REASONS, ROUTES } from '@ribas/shared';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { setUnauthorizedHandler } from '@/api/httpClient';
import { clearSession, loadSession, saveSession } from '@/lib/sessionStore';

import { SessionContext } from '../context';
import { authService } from '../services/authService';
import type { LoginRequest, LoginRouteParams, Session, SessionContextValue } from '../types';

/** setTimeout no admite esperas mayores a ~24,8 días. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura la sesión al abrir la app; loadSession descarta la que ya venció.
  useEffect(() => {
    let active = true;
    void loadSession().then((stored) => {
      if (!active) return;
      setSession(stored);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const dropSession = useCallback(() => {
    setSession(null);
    void clearSession();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const next = await authService.login(credentials);
    await saveSession(next);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    dropSession();
    await authService.logout();
  }, [dropSession]);

  // Cierra la sesión cuando vence: por temporizador y al volver del segundo plano
  // (los temporizadores no corren con la app suspendida).
  useEffect(() => {
    if (!session) return;
    const remaining = Date.parse(session.expiresAt) - Date.now();
    const timer = setTimeout(dropSession, Math.min(Math.max(remaining, 0), MAX_TIMEOUT_MS));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isExpired(session.expiresAt)) dropSession();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [session, dropSession]);

  // 401 del backend en una petición autenticada: cerrar sesión e ir a Login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      dropSession();
      const params: LoginRouteParams = { reason: LOGIN_REASONS.SESSION_EXPIRED };
      router.replace({ pathname: ROUTES.LOGIN, params });
    });
    return () => setUnauthorizedHandler(null);
  }, [dropSession]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      expiresAt: session?.expiresAt ?? null,
      isAuthenticated: session !== null,
      isLoading,
      login,
      logout,
    }),
    [session, isLoading, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
