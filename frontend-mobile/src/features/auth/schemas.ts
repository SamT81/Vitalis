import { z } from 'zod';

export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa tu correo electrónico.')
  .regex(EMAIL_RE, 'Ingresa un correo electrónico válido.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Ingresa tu contraseña.')
    .min(
      MIN_PASSWORD_LENGTH,
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    ),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
