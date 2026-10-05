import { httpClient } from '@/api/httpClient';
import { env } from '@/config/env';
import { EMPTY_PROFILE } from './types';
import type { DonorProfile, ProfileService } from './types';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const count = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;

/** Convierte cualquier respuesta en un perfil sin `undefined` ni datos inválidos. */
export function normalizeProfile(raw: unknown): DonorProfile {
  if (typeof raw !== 'object' || raw === null) return { ...EMPTY_PROFILE };
  const data = raw as Record<string, unknown>;
  return {
    bloodType: text(data.bloodType),
    city: text(data.city),
    donations: count(data.donations),
    points: count(data.points),
  };
}

/* Solo la donante de prueba tiene datos; el resto de cuentas no ha registrado nada. */
const MOCK_PROFILES: Readonly<Record<string, DonorProfile>> = {
  'usr-mock-0007': { bloodType: 'O+', city: 'Bogotá D.C.', donations: 6, points: 3150 },
};

export const mockProfileConfig: { delayMs: number } = { delayMs: env.MOCK_DELAY_MS / 2 };

const mockProfileService: ProfileService = {
  async getProfile(userId) {
    await delay(mockProfileConfig.delayMs);
    return { ...(MOCK_PROFILES[userId] ?? EMPTY_PROFILE) };
  },
};

const httpProfileService: ProfileService = {
  async getProfile(userId) {
    const { data } = await httpClient.get<unknown>(`/api/v1/donors/${encodeURIComponent(userId)}`);
    return normalizeProfile(data);
  },
};

export const profileService: ProfileService = env.USE_MOCK
  ? mockProfileService
  : httpProfileService;
