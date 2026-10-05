import { z } from 'zod';

const optionalText = z.string().trim().min(1).nullable().catch(null).default(null);

const optionalCount = z.number().finite().nonnegative().nullable().catch(null).default(null);

/**
 * Resumen del donante. Cualquier dato ausente o inválido queda en null
 * y la interfaz lo muestra como "Sin registrar".
 */
export const donorProfileSchema = z.object({
  bloodType: optionalText,
  city: optionalText,
  donations: optionalCount,
  points: optionalCount,
});

export type DonorProfile = z.infer<typeof donorProfileSchema>;
