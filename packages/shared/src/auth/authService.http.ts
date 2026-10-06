import type { AxiosInstance } from 'axios';

import { ApiError } from '../api/ApiError';
import { ERROR_CODES } from '../constants/errorMessages';
import { API_ENDPOINTS } from '../constants/routes';
import { toSession } from './session';
import type { AuthService, LoginResponse } from './types';

/** Implementación real contra el API Gateway (contrato del DD). */
export function createHttpAuthService(http: AxiosInstance): AuthService {
  return {
    async login(credentials) {
      const { data } = await http.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
      if (!data || data.valid !== true || !data.token) {
        throw new ApiError(401, ERROR_CODES.INVALID_CREDENTIALS);
      }
      return toSession(data, credentials.email);
    },

    // El contrato no define un endpoint de logout: el token se descarta en el cliente.
    async logout() {},

    async forgotPassword(email) {
      await http.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
    },
  };
}
