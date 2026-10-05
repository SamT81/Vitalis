import type { ServiceFactoryOptions } from '../auth/createAuthService';
import { createHttpProfileService } from './profileService.http';
import { mockProfileService } from './profileService.mock';
import type { ProfileService } from './types';

/** Factory (Strategy): elige la implementación según USE_MOCK. */
export function createProfileService({ useMock, http }: ServiceFactoryOptions): ProfileService {
  return useMock ? mockProfileService : createHttpProfileService(http);
}
