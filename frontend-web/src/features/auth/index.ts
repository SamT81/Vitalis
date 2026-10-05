import { env } from '@/config/env';
import type { AuthService } from './authService';
import { httpAuthService } from './authService.http';
import { mockAuthService } from './authService.mock';

/** Se elige con VITE_USE_MOCK (config/env.ts). */
export const authService: AuthService = env.USE_MOCK ? mockAuthService : httpAuthService;

export type { AuthService } from './authService';
export { roleLabel } from './roles';
export * from './schemas';
export type * from './types';
