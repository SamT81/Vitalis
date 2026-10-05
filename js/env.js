/* =============================================================================
   Vitalis · RIBAS — CONFIGURACIÓN DE ENTORNO (js/env.js)
   -----------------------------------------------------------------------------
   Único punto de configuración para conectar el frontend con el backend.
   Se carga ANTES de js/http-client.js, js/api-service.js y js/auth-service.js.

     USE_MOCK = true   → autenticación y datos simulados (sin backend).
     USE_MOCK = false  → peticiones reales al API Gateway en API_BASE_URL.

   Para conectar con el backend: USE_MOCK = false y la URL del gateway (Kong).
   ============================================================================= */

(function () {
  "use strict";

  window.Vitalis = window.Vitalis || {};
  window.Vitalis.env = {
    API_BASE_URL: "http://localhost:8000",
    USE_MOCK: true,
    REQUEST_TIMEOUT_MS: 10000,
    MOCK_DELAY_MS: 800,
  };
})();
