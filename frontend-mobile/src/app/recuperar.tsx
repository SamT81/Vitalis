import { AuthCard } from '@/components/layout/AuthCard';
import { Screen } from '@/components/layout/Screen';
import { ForgotPasswordForm } from '@/features/auth';

export default function ForgotPasswordScreen() {
  return (
    <Screen centered>
      <AuthCard
        icon="key"
        title="Recuperar contraseña"
        description="Escribe el correo de tu cuenta y te enviaremos las instrucciones para restablecerla."
      >
        <ForgotPasswordForm />
      </AuthCard>
    </Screen>
  );
}
