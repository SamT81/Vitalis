import { ROUTES } from '@ribas/shared';
import { Link } from 'expo-router';
import { Controller } from 'react-hook-form';
import { View } from 'react-native';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordForm() {
  const { control, errors, isSubmitting, formError, sent, submit } = useForgotPassword();

  return (
    <>
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
            <Alert variant="destructive" icon="alert-circle" message={formError} className="mb-4" />
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
                  onSubmitEditing={() => void submit()}
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
            onPress={() => void submit()}
          />
        </>
      )}

      <Link href={ROUTES.LOGIN} replace className="mt-5 self-center py-2">
        <Text weight="semibold" className="text-sm text-primary-700">
          Volver a iniciar sesión
        </Text>
      </Link>
    </>
  );
}
