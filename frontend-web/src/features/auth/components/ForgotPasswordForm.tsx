import { ROUTES } from '@ribas/shared';
import { CircleAlert, LoaderCircle, MailCheck, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordForm() {
  const { register, errors, isSubmitting, formError, sent, submit } = useForgotPassword();

  return (
    <>
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
          <form onSubmit={submit} noValidate>
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
        <Link to={ROUTES.LOGIN} className="font-semibold text-primary-700 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </>
  );
}
