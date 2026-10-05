import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert, KeyRound, LoaderCircle, MailCheck, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { messageFor } from '@/api/errors';
import { AuthCard } from '@/components/AuthCard';
import { FieldError } from '@/components/FieldError';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/features/auth';
import { forgotPasswordSchema } from '@/features/auth/schemas';
import type { ForgotPasswordFormValues } from '@/features/auth/schemas';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setFormError('');
    try {
      await authService.forgotPassword(values.email.toLowerCase());
      setSent(true);
    } catch (error) {
      setFormError(messageFor(error));
    }
  };

  return (
    <AuthCard
      icon={<KeyRound />}
      title="Recuperar contraseña"
      description="Escribe el correo de tu cuenta y te enviaremos las instrucciones para restablecerla."
    >
      {sent ? (
        <Alert variant="success" role="status">
          <MailCheck aria-hidden />
          <div>
            <AlertTitle>Revisa tu correo</AlertTitle>
            <AlertDescription>
              Si el correo está registrado en RIBAS, en unos minutos recibirás un enlace para
              restablecer tu contraseña.
            </AlertDescription>
          </div>
        </Alert>
      ) : (
        <>
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <CircleAlert aria-hidden />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-5">
              <Label htmlFor="forgot-email">Correo electrónico</Label>
              <Input
                id="forgot-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'forgot-email-error' : undefined}
                {...register('email')}
              />
              <FieldError id="forgot-email-error" message={errors.email?.message} />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden /> Enviando…
                </>
              ) : (
                <>
                  <Send aria-hidden /> Enviar instrucciones
                </>
              )}
            </Button>
          </form>
        </>
      )}

      <p className="mt-5 text-center text-sm">
        <Link to="/login" className="font-semibold text-primary-700 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthCard>
  );
}
