import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { isExpired } from './session';
import type { Session } from './types';

export const SESSION_KEY = 'ribas_session';

/**
 * En Android/iOS la sesión se guarda cifrada con expo-secure-store (Keystore / Keychain).
 * SecureStore no existe en navegador: el export web usa localStorage solo como respaldo.
 */
const storage =
  Platform.OS === 'web'
    ? {
        get: async (key: string) => globalThis.localStorage?.getItem(key) ?? null,
        set: async (key: string, value: string) => globalThis.localStorage?.setItem(key, value),
        remove: async (key: string) => globalThis.localStorage?.removeItem(key),
      }
    : {
        get: (key: string) => SecureStore.getItemAsync(key),
        set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        remove: (key: string) => SecureStore.deleteItemAsync(key),
      };

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

export async function clearSession(): Promise<void> {
  try {
    await storage.remove(SESSION_KEY);
  } catch {
    // almacenamiento no disponible: no hay nada que limpiar
  }
}

/** Sesión vigente o null. Si venció o está corrupta, la elimina. */
export async function loadSession(): Promise<Session | null> {
  let parsed: unknown;
  try {
    const raw = await storage.get(SESSION_KEY);
    if (!raw) return null;
    parsed = JSON.parse(raw);
  } catch {
    await clearSession();
    return null;
  }
  if (!isSession(parsed) || isExpired(parsed.expiresAt)) {
    await clearSession();
    return null;
  }
  return parsed;
}

export async function saveSession(session: Session): Promise<void> {
  try {
    await storage.set(SESSION_KEY, JSON.stringify(session));
  } catch {
    // sin almacenamiento la sesión vive solo en memoria
  }
}
