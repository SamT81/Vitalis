import type { Session } from '@ribas/shared';
import { parseStoredSession, STORAGE_KEYS } from '@ribas/shared';

/** Persistencia de la sesión en localStorage (clave `ribas_session`). */

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch {
    // almacenamiento no disponible: no hay nada que limpiar
  }
}

/** Sesión vigente o null. Si venció o está corrupta, la elimina. */
export function loadSession(): Session | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  } catch {
    // sin acceso al almacenamiento no hay sesión que restaurar
    return null;
  }
  const session = parseStoredSession(raw);
  if (raw && !session) clearSession();
  return session;
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch {
    // sin almacenamiento la sesión vive solo en memoria
  }
}
