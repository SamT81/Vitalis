/** Rutas de la app. Son las mismas en web (React Router) y móvil (Expo Router). */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/recuperar',
  REGISTER: '/registro',
  ACCOUNT: '/cuenta',
  PROFILE: '/perfil',
} as const;

/** Motivos con los que se llega a Login (estado de navegación o parámetro de ruta). */
export const LOGIN_REASONS = {
  SESSION_EXPIRED: 'expired',
} as const;

/** Endpoints del API Gateway. */
export const API_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  // Rutas propuestas: el DD aún no define estos dos contratos.
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  donorProfile: (userId: string) => `/api/v1/donors/${encodeURIComponent(userId)}`,
} as const;
