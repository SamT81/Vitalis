import { ROUTES } from '@ribas/shared';
import { LogIn } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthCard } from '@/components/layout/AuthCard';
import { env } from '@/config/env';
import { LoginForm, useSession } from '@/features/auth';
import type { LoginLocationState } from '@/features/auth';

export function LoginPage() {
  const { isAuthenticated } = useSession();
  const state = (useLocation().state ?? {}) as LoginLocationState;

  // Con sesión vigente (o recién iniciada) se sale de Login hacia Mi cuenta.
  if (isAuthenticated) return <Navigate to={state.from ?? ROUTES.ACCOUNT} replace />;

  return (
    <AuthCard
      icon={<LogIn />}
      title="Iniciar sesión"
      description="Accede a tu cuenta de la red RIBAS para ver tus datos, puntos y medallas."
    >
      <LoginForm sessionExpired={state.reason === 'expired'} showMockHint={env.USE_MOCK} />
    </AuthCard>
  );
}
