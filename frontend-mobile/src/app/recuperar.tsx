import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { messageFor } from '@/api/errors';
import { AuthCard } from '@/components/AuthCard';
import { FieldError } from '@/components/FieldError';
import { Screen } from '@/components/Screen';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { authService } from '@/features/auth';
import { forgotPasswordSchema } from '@/features/auth/schemas';
import type { ForgotPasswordFormValues } from '@/features/auth/schemas';

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    control,
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
    <Screen centered>
      <AuthCard
        icon="key"
        title="Recuperar contraseña"
        description="Escribe el correo de tu cuenta y te enviaremos las instrucciones para restablecerla."
      >
        {sent ? (
          <Alert
            variant="success"
            icon="check-circle"
            title="Revisa tu correo"
            message="Si el correo está registrado en RIBAS, en unos minutos recibirás un enlace para restablecer tu contraseña."
          />
        ) : (
          <>
            {formError ? (
              <Alert
                variant="destructive"
                icon="alert-circle"
                message={formError}
                className="mb-4"
              />
            ) : null}
            <View className="mb-5">
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
                    returnKeyType="send"
                    invalid={Boolean(errors.email)}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
              <FieldError message={errors.email?.message} />
            </View>
            <Button
              size="lg"
              title="Enviar instrucciones"
              loadingTitle="Enviando…"
              icon="send"
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </>
        )}

        <Link href="/login" replace className="mt-5 self-center py-2">
          <Text weight="semibold" className="text-sm text-primary-700">
            Volver a iniciar sesión
          </Text>
        </Link>
      </AuthCard>
    </Screen>
  );
}
