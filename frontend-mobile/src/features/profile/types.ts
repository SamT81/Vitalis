/** Resumen del donante. Cualquier dato puede faltar: la UI muestra "Sin registrar". */
export interface DonorProfile {
  bloodType: string | null;
  city: string | null;
  donations: number | null;
  points: number | null;
}

export const EMPTY_PROFILE: DonorProfile = {
  bloodType: null,
  city: null,
  donations: null,
  points: null,
};

export interface ProfileService {
  getProfile(userId: string): Promise<DonorProfile>;
}
