import { MOCK_DONOR_USER_ID } from '../auth/authService.mock';
import { mockSettings, wait } from '../lib/mock';
import type { DonorProfile, ProfileService } from './types';
import { EMPTY_PROFILE } from './types';

/* Solo la donante de prueba tiene datos; el resto de cuentas no ha registrado nada. */
const MOCK_PROFILES: Readonly<Record<string, DonorProfile>> = {
  [MOCK_DONOR_USER_ID]: { bloodType: 'O+', city: 'Bogotá D.C.', donations: 6, points: 3150 },
};

export const mockProfileService: ProfileService = {
  async getProfile(userId) {
    await wait(mockSettings.delayMs / 2);
    return { ...(MOCK_PROFILES[userId] ?? EMPTY_PROFILE) };
  },
};
