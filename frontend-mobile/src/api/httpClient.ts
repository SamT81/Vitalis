import { createHttpClient } from '@ribas/shared';
import { env } from '@/config/env';
import { loadSession } from '@/lib/sessionStore';

/**
 * Cliente Axios de la app: timeout de 10 s, Bearer automático y aviso ante 401.
 * La lógica vive en @ribas/shared; aquí solo se conecta con la configuración y la sesión.
 */
export const { http, setUnauthorizedHandler } = createHttpClient({
  baseURL: env.API_BASE_URL,
  timeoutMs: env.REQUEST_TIMEOUT_MS,
  getToken: async () => (await loadSession())?.token ?? null,
});
