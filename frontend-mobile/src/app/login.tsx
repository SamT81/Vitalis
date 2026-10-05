import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Redirect, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { messageFor } from '@/api/errors';
import { AuthCard } from '@/components/AuthCard';
import { FieldError } from '@/components/FieldError';
import { PasswordInput } from '@/components/PasswordInput';
import { Screen } from '@/components/Screen';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema } from '@/features/auth/schemas';
import type { LoginFormValues } from '@/features/auth/schemas';

export default function LoginScreen() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const [formError, setFormError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Con sesión vigente (o recién iniciada) se sale de Login hacia Mi cuenta.
  if (!isLoading && isAuthenticated) return <Redirect href="/cuenta" />;

  const onSubmit = async (values: LoginFormValues) => {
    setFormError('');
    try {
      await login({ email: values.email.toLowerCase(), password: values.password });
    } catch (error) {
      setFormError(messageFor(error));
    }
  };

  return (
    <Screen centered>
      <AuthCard
        icon="log-in"
        title="Iniciar sesión"
        description="Accede a tu cuenta de la red RIBAS para ver tus datos, puntos y medallas."
      >
        {reason === 'expired' && !formError ? (
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
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />
          <FieldError message={errors.password?.message} />
        </View>

        <Link href="/recuperar" className="mb-4 self-end py-2">
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
          onPress={handleSubmit(onSubmit)}
        />

        {env.USE_MOCK ? (
          <View className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Text className="text-xs leading-5 text-slate-600">
              <Text weight="semibold" className="text-xs text-slate-800">
                Modo simulado (sin backend).
              </Text>{' '}
              Usuario de prueba: donante@gmail.com · contraseña Ribas2026!. Más usuarios en el
              README.
            </Text>
          </View>
        ) : null}

        <View className="mt-5 flex-row flex-wrap items-center justify-center gap-1">
          <Text className="text-sm text-slate-600">¿Primera vez donando?</Text>
          <Link href="/registro" className="py-1">
            <Text weight="semibold" className="text-sm text-primary-700">
              Regístrate aquí
            </Text>
          </Link>
        </View>
      </AuthCard>
    </Screen>
  );
}
