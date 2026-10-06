import { ROUTES } from '@ribas/shared';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useSession } from '../hooks/useSession';
import type { LoginLocationState } from '../types';

/** Guardián de rutas: sin sesión vigente no hay excepción ni "modo dev". */
export function ProtectedRoute() {
  const { isAuthenticated } = useSession();
  const location = useLocation();

  if (!isAuthenticated) {
    const state: LoginLocationState = { from: location.pathname };
    return <Navigate to={ROUTES.LOGIN} replace state={state} />;
  }
  return <Outlet />;
}
