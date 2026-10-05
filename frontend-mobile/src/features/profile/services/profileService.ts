import { createProfileService } from '@ribas/shared';
import { http } from '@/api/httpClient';
import { env } from '@/config/env';

/** Mock o backend real según EXPO_PUBLIC_USE_MOCK. */
export const profileService = createProfileService({ useMock: env.USE_MOCK, http });
