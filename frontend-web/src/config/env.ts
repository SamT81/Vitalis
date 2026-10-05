/**
 * Único punto de configuración para conectar el frontend con el backend.
 *
 *   VITE_USE_MOCK=true   → autenticación y datos simulados (sin backend).
 *   VITE_USE_MOCK=false  → peticiones reales al API Gateway en VITE_API_BASE_URL.
 */
export const env = {
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/+$/, ''),
  /** Mock activo salvo que se apague explícitamente con "false". */
  USE_MOCK: import.meta.env.VITE_USE_MOCK !== 'false',
  REQUEST_TIMEOUT_MS: 10_000,
  MOCK_DELAY_MS: 800,
} as const;
