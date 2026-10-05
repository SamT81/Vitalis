import { isExpired } from './session';
import type { Session } from './types';

export const SESSION_KEY = 'ribas_session';

export function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Session>;
  return (
    typeof candidate.token === 'string' &&
    candidate.token.length > 0 &&
    typeof candidate.expiresAt === 'string' &&
    typeof candidate.user === 'object' &&
    candidate.user !== null &&
    typeof candidate.user.email === 'string' &&
    Array.isArray(candidate.user.roles)
  );
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // almacenamiento no disponible: no hay nada que limpiar
  }
}

/** Sesión vigente o null. Si venció o está corrupta, la elimina. */
export function loadSession(): Session | null {
  let parsed: unknown;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    parsed = JSON.parse(raw);
  } catch {
    clearSession();
    return null;
  }
  if (!isSession(parsed) || isExpired(parsed.expiresAt)) {
    clearSession();
    return null;
  }
  return parsed;
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // sin almacenamiento la sesión vive solo en memoria
  }
}
