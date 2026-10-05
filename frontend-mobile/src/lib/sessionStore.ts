import { parseStoredSession, STORAGE_KEYS } from '@ribas/shared';
import type { Session } from '@ribas/shared';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Persistencia de la sesión (clave `ribas_session`).
 * En Android/iOS se guarda cifrada con expo-secure-store (Keystore / Keychain).
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

export async function clearSession(): Promise<void> {
  try {
    await storage.remove(STORAGE_KEYS.SESSION);
  } catch {
    // almacenamiento no disponible: no hay nada que limpiar
  }
}

/** Sesión vigente o null. Si venció o está corrupta, la elimina. */
export async function loadSession(): Promise<Session | null> {
  let raw: string | null;
  try {
    raw = await storage.get(STORAGE_KEYS.SESSION);
  } catch {
    return null;
  }
  const session = parseStoredSession(raw);
  if (raw && !session) await clearSession();
  return session;
}

export async function saveSession(session: Session): Promise<void> {
  try {
    await storage.set(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch {
    // sin almacenamiento la sesión vive solo en memoria
  }
}
