/**
 * Único punto de configuración para conectar la app con el backend.
 *
 *   EXPO_PUBLIC_USE_MOCK=true   → autenticación y datos simulados (sin backend).
 *   EXPO_PUBLIC_USE_MOCK=false  → peticiones reales al API Gateway en EXPO_PUBLIC_API_BASE_URL.
 *
 * Expo solo reemplaza `process.env.EXPO_PUBLIC_*` escrito con notación de punto.
 */
export const env = {
  API_BASE_URL: (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000').replace(
    /\/+$/,
    '',
  ),
  /** Mock activo salvo que se apague explícitamente con "false". */
  USE_MOCK: process.env.EXPO_PUBLIC_USE_MOCK !== 'false',
  REQUEST_TIMEOUT_MS: 10_000,
  MOCK_DELAY_MS: 800,
} as const;
