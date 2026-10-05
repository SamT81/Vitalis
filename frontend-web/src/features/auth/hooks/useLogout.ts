import { ROUTES } from '@ribas/shared';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from './useSession';

/** Cierra la sesión y lleva a Login. */
export function useLogout() {
  const { logout } = useSession();
  const navigate = useNavigate();

  return useCallback(async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }, [logout, navigate]);
}
