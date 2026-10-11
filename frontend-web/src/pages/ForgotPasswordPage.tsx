import { AuthCard } from '@/components/layout/AuthCard';
import { ForgotPasswordForm } from '@/features/auth';

export function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Recuperar contraseña"
      description="Escribe el correo de tu cuenta y te enviaremos las instrucciones para restablecerla."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
