import type { AxiosInstance } from 'axios';
import { createHttpAuthService } from './authService.http';
import { mockAuthService } from './authService.mock';
import type { AuthService } from './types';

export interface ServiceFactoryOptions {
  /** true → implementación simulada; false → backend real. */
  useMock: boolean;
  http: AxiosInstance;
}

/** Factory (Strategy): elige la implementación según USE_MOCK. */
export function createAuthService({ useMock, http }: ServiceFactoryOptions): AuthService {
  return useMock ? mockAuthService : createHttpAuthService(http);
}
