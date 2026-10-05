import axios from 'axios';
import { env } from '@/config/env';
import { loadSession } from '@/features/auth/sessionStore';
import { ApiError } from './errors';

/**
 * Cliente único para el API Gateway:
 *  · baseURL y timeout (10 s) desde config/env.
 *  · Agrega `Authorization: Bearer <token>` si hay sesión vigente.
 *  · Ante un 401 en una petición autenticada avisa para cerrar sesión e ir a Login.
 *  · Normaliza todo fallo a ApiError (status 0 + NETWORK_ERROR si no hubo respuesta).
 *
 * Nunca registra en consola el token ni el cuerpo de la petición (Ley 1581 de 2012).
 */
export const httpClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.REQUEST_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

let unauthorizedHandler: (() => void) | null = null;

/** Lo registra AuthContext: cierra la sesión y navega a Login. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

interface ErrorBody {
  code?: unknown;
  message?: unknown;
  timestamp?: unknown;
}

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value ? value : undefined;

httpClient.interceptors.request.use((config) => {
  const session = loadSession();
  if (session) config.headers.set('Authorization', `Bearer ${session.token}`);
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status } = error.response;
      const body = (error.response.data ?? {}) as ErrorBody;
      const wasAuthenticated = Boolean(error.config?.headers?.has('Authorization'));
      // 401 con token enviado = sesión inválida o vencida en el backend.
      if (status === 401 && wasAuthenticated) unauthorizedHandler?.();
      return Promise.reject(
        new ApiError(
          status,
          asString(body.code) ?? 'UNKNOWN_ERROR',
          asString(body.message),
          asString(body.timestamp),
        ),
      );
    }
    // Red caída, CORS, timeout o gateway inalcanzable.
    return Promise.reject(new ApiError(0, 'NETWORK_ERROR'));
  },
);
