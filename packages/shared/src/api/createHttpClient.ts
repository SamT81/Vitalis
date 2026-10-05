import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { ERROR_CODES } from '../constants/errorMessages';
import { ApiError } from './ApiError';

interface HttpClientOptions {
  baseURL: string;
  timeoutMs: number;
  /** Token de la sesión vigente (o null). Cada app lo lee de su almacenamiento. */
  getToken: () => string | null | Promise<string | null>;
}

interface HttpClient {
  http: AxiosInstance;
  /** Lo registra AuthProvider: cierra la sesión y navega a Login. */
  setUnauthorizedHandler: (handler: (() => void) | null) => void;
}

interface ErrorBody {
  code?: unknown;
  message?: unknown;
  timestamp?: unknown;
}

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value ? value : undefined;

/**
 * Cliente único para el API Gateway:
 *  · baseURL y timeout configurables.
 *  · Agrega `Authorization: Bearer <token>` si hay sesión vigente.
 *  · Ante un 401 en una petición autenticada avisa para cerrar sesión e ir a Login.
 *  · Normaliza todo fallo a ApiError (status 0 + NETWORK_ERROR si no hubo respuesta).
 *
 * Nunca registra en consola el token ni el cuerpo de la petición (Ley 1581 de 2012).
 */
export function createHttpClient({ baseURL, timeoutMs, getToken }: HttpClientOptions): HttpClient {
  const http = axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: { Accept: 'application/json' },
  });

  let unauthorizedHandler: (() => void) | null = null;

  http.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  });

  http.interceptors.response.use(
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
            asString(body.code) ?? ERROR_CODES.UNKNOWN_ERROR,
            asString(body.message),
            asString(body.timestamp),
          ),
        );
      }
      // Red caída, CORS, timeout o gateway inalcanzable.
      return Promise.reject(new ApiError(0, ERROR_CODES.NETWORK_ERROR));
    },
  );

  return {
    http,
    setUnauthorizedHandler(handler) {
      unauthorizedHandler = handler;
    },
  };
}
