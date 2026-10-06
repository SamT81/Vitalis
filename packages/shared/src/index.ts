// Constantes
export { ERROR_CODES, ERROR_MESSAGES } from './constants/errorMessages';
export { roleLabel, ROLES } from './constants/roles';
export { LOGIN_REASONS, ROUTES } from './constants/routes';
export { STORAGE_KEYS } from './constants/storageKeys';

// API
export { ApiError, messageFor } from './api/ApiError';
export { createHttpClient } from './api/createHttpClient';

// Autenticación
export { createHttpAuthService } from './auth/authService.http';
export { MOCK_PASSWORD, mockAuthService, resetMockAuth } from './auth/authService.mock';
export { createAuthService } from './auth/createAuthService';
export type { ForgotPasswordFormValues, LoginFormValues } from './auth/schemas';
export { forgotPasswordSchema, loginSchema } from './auth/schemas';
export { isExpired, parseStoredSession } from './auth/session';
export type { AuthService, AuthUser, LoginRequest, LoginResponse, Session } from './auth/types';

// Perfil de donante
export type { Badge } from './profile/badges';
export { BADGES, donorLevel, LIVES_PER_DONATION, unlockedBadges } from './profile/badges';
export { createProfileService } from './profile/createProfileService';
export type { DonorProfile, ProfileService } from './profile/types';
export { EMPTY_PROFILE } from './profile/types';

// Contenido y utilidades
export type { HomeBenefitId } from './content/home';
export { HOME_BENEFITS, HOME_CONTENT, HOME_STATS, HOME_STEPS } from './content/home';
export {
  firstName,
  formatDateTime,
  formatNumber,
  formatRemaining,
  initials,
  NOT_REGISTERED,
  orNotRegistered,
} from './lib/format';
export { mockSettings } from './lib/mock';
