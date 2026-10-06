import { useContext } from 'react';

import { SessionContext } from '../context';
import type { SessionContextValue } from '../types';

/** Sesión actual: user, token, isAuthenticated, login y logout. */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de <AuthProvider>.');
  return context;
}
