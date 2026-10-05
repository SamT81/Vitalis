import { ApiError } from '@/api/errors';
import { httpClient } from '@/api/httpClient';
import type { AuthService } from './authService';
import { toSession } from './session';
import type { LoginResponse } from './types';

/** Implementación real contra el API Gateway (contrato del DD). */
export const httpAuthService: AuthService = {
  async login(credentials) {
    const { data } = await httpClient.post<LoginResponse>('/api/v1/auth/login', credentials);
    if (!data || data.valid !== true || !data.token) throw new ApiError(401, 'INVALID_CREDENTIALS');
    return toSession(data, credentials.email);
  },

  // El contrato no define un endpoint de logout: el token se descarta en el cliente.
  async logout() {},

  // Ruta propuesta: el DD aún no define este contrato (ver README).
  async forgotPassword(email) {
    await httpClient.post('/api/v1/auth/forgot-password', { email });
  },
};
