import { MOCK_PASSWORD, ROUTES } from '@ribas/shared';
import { CircleAlert, Clock, LoaderCircle, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useLogin } from '../hooks/useLogin';

interface LoginFormProps {
  /** Muestra el aviso de sesión vencida. */
  sessionExpired?: boolean;
  /** Muestra la ayuda con el usuario de prueba (solo en modo simulado). */
  showMockHint?: boolean;
}

export function LoginForm({ sessionExpired = false, showMockHint = false }: LoginFormProps) {
  const { register, errors, isSubmitting, formError, submit } = useLogin();

  return (
    <>
      {sessionExpired && !formError && (
        <Alert variant="warning" role="status" className="mb-4">
          <Clock aria-hidden />
          <AlertDescription>Tu sesión venció. Inicia sesión de nuevo.</AlertDescription>
        </Alert>
      )}

      {formError && (
        <Alert variant="destructive" className="mb-4">
          <CircleAlert aria-hidden />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={submit} noValidate>
        <div className="mb-4">
          <Label htmlFor="login-email">Correo electrónico</Label>
          <Input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            {...register('email')}
          />
          <FieldError id="login-email-error" message={errors.email?.message} />
        </div>

        <div className="mb-2">
          <Label htmlFor="login-password">Contraseña</Label>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            {...register('password')}
          />
          <FieldError id="login-password-error" message={errors.password?.message} />
        </div>

        <div className="mb-4 text-right">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-sm font-medium text-primary-700 hover:text-primary-800 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden /> Ingresando…
            </>
          ) : (
            <>
              <LogIn aria-hidden /> Ingresar
            </>
          )}
        </Button>
      </form>

      {showMockHint && (
        <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
          <b className="text-slate-800">Modo simulado (sin backend).</b> Usuario de prueba:{' '}
          <code className="break-all text-primary-700">donante@gmail.com</code> · contraseña{' '}
          <code className="text-primary-700">{MOCK_PASSWORD}</code>. Más usuarios en el README.
        </p>
      )}

      <p className="mt-5 text-center text-sm text-slate-600">
        ¿Primera vez donando?{' '}
        <Link to={ROUTES.REGISTER} className="font-semibold text-primary-700 hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </>
  );
}
