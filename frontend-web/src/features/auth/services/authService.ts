import { createAuthService } from '@ribas/shared';
import { http } from '@/api/httpClient';
import { env } from '@/config/env';

/** Mock o backend real según VITE_USE_MOCK. */
export const authService = createAuthService({ useMock: env.USE_MOCK, http });
