import type { AxiosInstance } from 'axios';
import { API_ENDPOINTS } from '../constants/routes';
import { donorProfileSchema } from './schemas';
import { EMPTY_PROFILE } from './types';
import type { ProfileService } from './types';

/** Implementación real contra el API Gateway. */
export function createHttpProfileService(http: AxiosInstance): ProfileService {
  return {
    async getProfile(userId) {
      const { data } = await http.get<unknown>(API_ENDPOINTS.donorProfile(userId));
      const parsed = donorProfileSchema.safeParse(data);
      return parsed.success ? parsed.data : { ...EMPTY_PROFILE };
    },
  };
}
