import type { DonorProfile } from './schemas';

export type { DonorProfile };

export const EMPTY_PROFILE: DonorProfile = {
  bloodType: null,
  city: null,
  donations: null,
  points: null,
};

/** Interfaz común de las implementaciones real (http) y simulada (mock). */
export interface ProfileService {
  getProfile(userId: string): Promise<DonorProfile>;
}
