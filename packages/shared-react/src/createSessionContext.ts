import { createContext, useContext } from 'react';

/**
 * Crea el contexto de sesión y su hook `useSession`.
 * Cada app define la forma del valor (móvil agrega `isLoading`) y lo provee con su AuthProvider.
 */
export function createSessionContext<TValue>() {
  const SessionContext = createContext<TValue | null>(null);

  /** Sesión actual. Debe usarse dentro de <AuthProvider>. */
  function useSession(): TValue {
    const context = useContext(SessionContext);
    if (!context) throw new Error('useSession debe usarse dentro de <AuthProvider>.');
    return context;
  }

  return { SessionContext, useSession };
}
