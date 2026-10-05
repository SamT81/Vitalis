/* =============================================================================
   Vitalis · RIBAS — CLIENTE HTTP (js/http-client.js)
   -----------------------------------------------------------------------------
   Cliente único para las peticiones al API Gateway (contratos del DD):
     · baseURL y timeout desde js/env.js.
     · Agrega `Authorization: Bearer <token>` si hay sesión (ribas_session).
     · Ante un 401 en una petición autenticada cierra la sesión y manda a login.
     · Normaliza todo fallo al esquema de error del DD:
         { status, code, message, timestamp }
       (status 0 + code NETWORK_ERROR cuando no hay respuesta del servidor).

   Uso:
     const data = await Vitalis.http.post("/api/v1/auth/login", body, { auth: false });

   Nunca registra en consola el token ni el cuerpo de la petición (Ley 1581).
   ============================================================================= */

(function () {
  "use strict";

  const V = (window.Vitalis = window.Vitalis || {});

  const SESSION_KEY        = "ribas_session";
  const LEGACY_SESSION_KEY = "vitalis_session";

  const apiError = (status, code, message, timestamp) => ({
    status, code, message: message || "", timestamp: timestamp || new Date().toISOString(),
  });

  function readToken() {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      return (s && s.token) || null;
    } catch { return null; }
  }

  /* 401 con token enviado = sesión inválida o vencida en el backend. */
  function handleUnauthorized() {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LEGACY_SESSION_KEY);
    } catch {}
    const page = (location.pathname.split("/").pop() || "index.html");
    if (page !== "login.html") location.replace("login.html?next=" + encodeURIComponent(page));
  }

  async function request(method, path, options = {}) {
    const env = V.env || {};
    const headers = { "Accept": "application/json" };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";

    const token = options.auth === false ? null : readToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), env.REQUEST_TIMEOUT_MS || 10000);

    let res;
    try {
      res = await fetch((env.API_BASE_URL || "") + path, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
    } catch (_) {
      // Red caída, CORS, timeout o gateway inalcanzable
      throw apiError(0, "NETWORK_ERROR");
    } finally {
      clearTimeout(timer);
    }

    let data = null;
    try { data = await res.json(); } catch (_) { data = null; }

    if (res.ok) return data;

    if (res.status === 401 && token) handleUnauthorized();
    throw apiError(res.status, (data && data.code) || "UNKNOWN_ERROR", data && data.message, data && data.timestamp);
  }

  V.http = {
    request,
    apiError,
    get:   (path, options)       => request("GET", path, options),
    post:  (path, body, options) => request("POST", path, Object.assign({}, options, { body })),
    put:   (path, body, options) => request("PUT", path, Object.assign({}, options, { body })),
    patch: (path, body, options) => request("PATCH", path, Object.assign({}, options, { body })),
  };
})();
