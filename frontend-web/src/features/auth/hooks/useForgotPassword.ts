import { zodResolver } from '@hookform/resolvers/zod';
import { messageFor } from '@ribas/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { ForgotPasswordFormValues } from '../schemas';
import { forgotPasswordSchema } from '../schemas';
import { authService } from '../services/authService';

/** Formulario de recuperar contraseña: validación, envío y confirmación. */
export function useForgotPassword() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const submit = form.handleSubmit(async (values) => {
    setFormError('');
    try {
      await authService.forgotPassword(values.email.toLowerCase());
      setSent(true);
    } catch (error) {
      setFormError(messageFor(error));
    }
  });

  return {
    register: form.register,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    formError,
    sent,
    submit,
  };
}
