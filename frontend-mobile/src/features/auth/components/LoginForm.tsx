import { MOCK_PASSWORD, ROUTES } from '@ribas/shared';
import { Link } from 'expo-router';
import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Text } from '@/components/ui/Text';

import { useLogin } from '../hooks/useLogin';

interface LoginFormProps {
  /** Muestra el aviso de sesión vencida. */
  sessionExpired?: boolean;
  /** Muestra la ayuda con el usuario de prueba (solo en modo simulado). */
  showMockHint?: boolean;
}

export function LoginForm({ sessionExpired = false, showMockHint = false }: LoginFormProps) {
  const { control, errors, isSubmitting, formError, submit } = useLogin();

  return (
    <>
      {sessionExpired && !formError ? (
        <Alert
          variant="warning"
          icon="clock"
          message="Tu sesión venció. Inicia sesión de nuevo."
          className="mb-4"
        />
      ) : null}

      {formError ? (
        <Alert variant="destructive" icon="alert-circle" message={formError} className="mb-4" />
      ) : null}

      <View className="mb-4">
        <Label>Correo electrónico</Label>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              accessibilityLabel="Correo electrónico"
              placeholder="tucorreo@ejemplo.com"
              keyboardType="email-address"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              invalid={Boolean(errors.email)}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <FieldError message={errors.email?.message} />
      </View>

      <View className="mb-2">
        <Label>Contraseña</Label>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              accessibilityLabel="Contraseña"
              placeholder="••••••••"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              invalid={Boolean(errors.password)}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={() => void submit()}
            />
          )}
        />
        <FieldError message={errors.password?.message} />
      </View>

      <Link href={ROUTES.FORGOT_PASSWORD} className="mb-4 self-end py-2">
        <Text weight="medium" className="text-sm text-primary-700">
          ¿Olvidaste tu contraseña?
        </Text>
      </Link>

      <Button
        size="lg"
        title="Ingresar"
        loadingTitle="Ingresando…"
        icon="log-in"
        loading={isSubmitting}
        onPress={() => void submit()}
      />

      {showMockHint ? (
        <View className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Text className="text-xs leading-5 text-slate-600">
            <Text weight="semibold" className="text-xs text-slate-800">
              Modo simulado (sin backend).
            </Text>{' '}
            Usuario de prueba: donante@gmail.com · contraseña {MOCK_PASSWORD}. Más usuarios en el
            README.
          </Text>
        </View>
      ) : null}

      <View className="mt-5 flex-row flex-wrap items-center justify-center gap-1">
        <Text className="text-sm text-slate-600">¿Primera vez donando?</Text>
        <Link href={ROUTES.REGISTER} className="py-1">
          <Text weight="semibold" className="text-sm text-primary-700">
            Regístrate aquí
          </Text>
        </Link>
      </View>
    </>
  );
}
