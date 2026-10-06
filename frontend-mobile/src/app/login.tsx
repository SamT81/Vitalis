import { LOGIN_REASONS, ROUTES } from '@ribas/shared';
import { Redirect, useLocalSearchParams } from 'expo-router';

import { AuthCard } from '@/components/layout/AuthCard';
import { Screen } from '@/components/layout/Screen';
import { env } from '@/config/env';
import type { LoginRouteParams } from '@/features/auth';
import { LoginForm, useSession } from '@/features/auth';

export default function LoginScreen() {
  const { isAuthenticated, isLoading } = useSession();
  const { reason } = useLocalSearchParams<LoginRouteParams>();

  // Con sesión vigente (o recién iniciada) se sale de Login hacia Mi cuenta.
  if (!isLoading && isAuthenticated) return <Redirect href={ROUTES.ACCOUNT} />;

  return (
    <Screen centered>
      <AuthCard
        icon="log-in"
        title="Iniciar sesión"
        description="Accede a tu cuenta de la red RIBAS para ver tus datos, puntos y medallas."
      >
        <LoginForm
          sessionExpired={reason === LOGIN_REASONS.SESSION_EXPIRED}
          showMockHint={env.USE_MOCK}
        />
      </AuthCard>
    </Screen>
  );
}
