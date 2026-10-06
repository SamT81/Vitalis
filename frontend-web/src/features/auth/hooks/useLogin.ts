import { zodResolver } from '@hookform/resolvers/zod';
import { messageFor } from '@ribas/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { LoginFormValues } from '../schemas';
import { loginSchema } from '../schemas';
import { useSession } from './useSession';

/** Formulario de login: validación con Zod, envío y error del servidor en español. */
export function useLogin() {
  const { login } = useSession();
  const [formError, setFormError] = useState('');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = form.handleSubmit(async (values) => {
    setFormError('');
    try {
      await login({ email: values.email.toLowerCase(), password: values.password });
    } catch (error) {
      setFormError(messageFor(error));
    }
  });

  return {
    register: form.register,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    formError,
    submit,
  };
}
