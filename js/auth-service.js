/* =============================================================================
   Vitalis · RIBAS — SERVICIO DE AUTENTICACIÓN (js/auth-service.js)
   -----------------------------------------------------------------------------
   Login contra el contrato del DD (Servicio de Identidad y Acceso):

     POST /api/v1/auth/login   { email, password }
     200 → { valid, userId, institutionId, roles[], token, expiresAt }
     401 → { code: "INVALID_CREDENTIALS", message, timestamp }

   Dos implementaciones con la misma interfaz { login, forgotPassword }:
     · httpAuth → backend real, vía js/http-client.js
     · mockAuth → simulada (retardo de env.MOCK_DELAY_MS), misma forma de respuesta
   Se elige con `Vitalis.env.USE_MOCK` (js/env.js).

   Sesión: `ribas_session` = { token, expiresAt, user: { userId, email, name,
   roles, institutionId } }. Además se sincroniza la sesión heredada
   (vitalis_users / vitalis_session) para que js/auth-guard.js, js/auth.js y
   los paneles por rol sigan funcionando sin cambios.

   Depende de: js/env.js y js/http-client.js (cargados antes).
   Nunca registra en consola el token ni la contraseña (Ley 1581 de 2012).
   ============================================================================= */

(function () {
  "use strict";

  const V = (window.Vitalis = window.Vitalis || {});

  const SESSION_KEY        = "ribas_session";
  const LEGACY_USERS_KEY   = "vitalis_users";
  const LEGACY_SESSION_KEY = "vitalis_session";
  const ATTEMPTS_KEY       = "ribas_mock_attempts";

  const read   = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
  const write  = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const remove = (k)     => { try { localStorage.removeItem(k); } catch {} };

  const env = () => V.env || { USE_MOCK: true };

  const apiError = (status, code, message) => ({
    status, code, message: message || "", timestamp: new Date().toISOString(),
  });

  /* ─── Mensajes de error (único lugar donde se mapea code → texto) ───────── */
  const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: "El correo o la contraseña son incorrectos.",
    ACCOUNT_LOCKED:      "Demasiados intentos. Intenta de nuevo en unos minutos.",
    USER_DISABLED:       "Tu cuenta está deshabilitada. Contacta al administrador de tu institución.",
    ROLE_NOT_SUPPORTED:  "Tu cuenta no tiene un rol habilitado en esta plataforma.",
    NETWORK_ERROR:       "No hay conexión con el servidor.",
  };
  const GENERIC_ERROR = "Ocurrió un error inesperado. Intenta de nuevo.";

  const messageFor = (err) => (err && ERROR_MESSAGES[err.code]) || GENERIC_ERROR;

  /* ─── Roles del backend → roles internos del frontend ───────────────────── */
  const BACKEND_ROLE = {
    superusuario:                "admin_general",
    administrador_nacional:      "admin_general",
    administrador_institucional: "admin_institucional",
    banco_sangre_admin:          "admin_institucional",
    personal_banco_sangre:       "operativo",
    personal_logistica:          "operativo",
    auditor_invima:              "auditor",
    donante:                     "donante",
  };
  const BACKEND_ROLE_LABEL = {
    superusuario:                "Superusuario",
    administrador_nacional:      "Administrador nacional",
    administrador_institucional: "Administrador institucional",
    banco_sangre_admin:          "Administrador de banco de sangre",
    personal_banco_sangre:       "Personal de banco de sangre",
    personal_logistica:          "Personal de logística",
    auditor_invima:              "Auditor INVIMA",
    donante:                     "Donante",
  };
  /* Si el usuario trae varios roles, manda el de mayor alcance. */
  const INTERNAL_PRIORITY = ["admin_general", "admin_institucional", "auditor", "operativo", "donante"];

  function internalRole(roles) {
    const mapped = (Array.isArray(roles) ? roles : []).map((r) => BACKEND_ROLE[r]).filter(Boolean);
    return INTERNAL_PRIORITY.find((r) => mapped.includes(r)) || null;
  }
  const roleLabel = (role) => BACKEND_ROLE_LABEL[role] || role;

  /* ─── Validación de formularios ─────────────────────────────────────────── */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const MIN_PASSWORD = 8;

  function validateEmail(email) {
    const value = String(email || "").trim();
    if (!value) return "Ingresa tu correo electrónico.";
    if (!EMAIL_RE.test(value)) return "Ingresa un correo electrónico válido.";
    return "";
  }

  function validateLogin(data) {
    const errors = {};
    const email = validateEmail(data && data.email);
    if (email) errors.email = email;
    const password = String((data && data.password) || "");
    if (!password) errors.password = "Ingresa tu contraseña.";
    else if (password.length < MIN_PASSWORD) errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
    return { ok: Object.keys(errors).length === 0, errors };
  }

  /* ─── Implementación real (API Gateway) ─────────────────────────────────── */
  const httpAuth = {
    login: (req) => V.http.post("/api/v1/auth/login", req, { auth: false }),
    // El DD aún no define este contrato: ruta propuesta, pendiente de confirmar con backend.
    forgotPassword: (email) => V.http.post("/api/v1/auth/forgot-password", { email }, { auth: false }),
    profileHint: () => null,
  };

  /* ─── Implementación simulada ───────────────────────────────────────────── */
  const MOCK_PASSWORD      = "Ribas2026!";
  const MOCK_SESSION_HOURS = 8;
  const LOCK_MAX_FAILS     = 5;
  const LOCK_WINDOW_MS     = 60 * 1000;
  const LOCK_DURATION_MS   = 2 * 60 * 1000;

  const MOCK_USERS = [
    { email: "superadmin@vitalis.co",    userId: "usr-mock-0001", roles: ["superusuario"],                institutionId: "inst-uuid-vitalis",        name: "Julián Torres Medina",   institution: "Vitalis · RIBAS (Sistema)" },
    { email: "admin.nacional@ribas.co",  userId: "usr-mock-0002", roles: ["administrador_nacional"],      institutionId: "inst-uuid-ribas-nacional", name: "Andrea Castillo Vargas", institution: "Coordinación Nacional RIBAS" },
    { email: "admin@bancobogota.co",     userId: "usr-mock-0003", roles: ["administrador_institucional"], institutionId: "inst-uuid-bogota-01",      name: "Ricardo Peña Londoño",   institution: "Banco de Sangre Bogotá" },
    { email: "personal@bancobogota.co",  userId: "usr-mock-0004", roles: ["personal_banco_sangre"],       institutionId: "inst-uuid-bogota-01",      name: "Natalia Rojas Marín",    institution: "Banco de Sangre Bogotá" },
    { email: "logistica@bancobogota.co", userId: "usr-mock-0005", roles: ["personal_logistica"],          institutionId: "inst-uuid-bogota-01",      name: "Óscar Beltrán Cruz",     institution: "Banco de Sangre Bogotá" },
    { email: "auditor@invima.gov.co",    userId: "usr-mock-0006", roles: ["auditor_invima"],              institutionId: "inst-uuid-invima",         name: "Juan Pérez Gómez",       institution: "INVIMA" },
    { email: "donante@gmail.com",        userId: "usr-mock-0007", roles: ["donante"],                     institutionId: null,                       name: "Camila Herrera Ruiz",    institution: "" },
    { email: "inactivo@bancobogota.co",  userId: "usr-mock-0008", roles: ["personal_banco_sangre"],       institutionId: "inst-uuid-bogota-01",      name: "Cuenta Deshabilitada",   institution: "Banco de Sangre Bogotá", disabled: true },
  ];

  /* Rol interno → rol del backend, para las cuentas locales (demo y registradas). */
  const LOCAL_ROLE_TO_BACKEND = {
    admin_general: "superusuario", admin_institucional: "administrador_institucional",
    operativo: "personal_banco_sangre", auditor: "auditor_invima", donante: "donante",
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const mockDelay = () => delay(env().MOCK_DELAY_MS == null ? 800 : env().MOCK_DELAY_MS);

  function mockToken(userId, expiresAt) {
    const payload = JSON.stringify({ sub: userId, exp: Math.floor(Date.parse(expiresAt) / 1000) });
    const encoded = typeof btoa === "function" ? btoa(payload) : payload;
    return "mock." + encoded + ".signature";
  }

  function registerFailure(email, now) {
    const attempts = read(ATTEMPTS_KEY, {});
    const entry = attempts[email] || { fails: [], lockedUntil: 0 };
    entry.fails = entry.fails.filter((t) => now - t < LOCK_WINDOW_MS).concat(now);
    if (entry.fails.length >= LOCK_MAX_FAILS) { entry.lockedUntil = now + LOCK_DURATION_MS; entry.fails = []; }
    attempts[email] = entry;
    write(ATTEMPTS_KEY, attempts);
  }

  function clearFailures(email) {
    const attempts = read(ATTEMPTS_KEY, {});
    if (attempts[email]) { delete attempts[email]; write(ATTEMPTS_KEY, attempts); }
  }

  const findLocalUser = (email) =>
    read(LEGACY_USERS_KEY, []).find((u) => String(u.email || "").toLowerCase() === email) || null;

  const mockAuth = {
    async login(req) {
      await mockDelay();
      const email = req.email;
      const now = Date.now();

      const entry = read(ATTEMPTS_KEY, {})[email];
      if (entry && entry.lockedUntil > now) throw apiError(429, "ACCOUNT_LOCKED", ERROR_MESSAGES.ACCOUNT_LOCKED);

      // 1) Usuarios de prueba del backend simulado · 2) cuentas locales (demo y registradas)
      const seeded = MOCK_USERS.find((u) => u.email === email);
      const local = findLocalUser(email);
      let account = null;
      if (seeded && req.password === MOCK_PASSWORD) {
        account = seeded;
      } else if (local && local.password && local.password === req.password) {
        const backendRole = LOCAL_ROLE_TO_BACKEND[local.role] || "donante";
        account = { userId: local.id, roles: [backendRole], institutionId: local.institutionId || null };
      }

      if (!account) {
        registerFailure(email, now);
        throw apiError(401, "INVALID_CREDENTIALS", "El correo o la contraseña son incorrectos");
      }
      if (account.disabled) throw apiError(403, "USER_DISABLED", ERROR_MESSAGES.USER_DISABLED);

      clearFailures(email);
      const expiresAt = new Date(now + MOCK_SESSION_HOURS * 3600 * 1000).toISOString();
      return {
        valid: true,
        userId: account.userId,
        institutionId: account.institutionId,
        roles: account.roles.slice(),
        token: mockToken(account.userId, expiresAt),
        expiresAt,
      };
    },

    async forgotPassword() {
      await mockDelay();
      return { ok: true };
    },

    /* Datos de presentación que el contrato de login no trae (nombre, institución). */
    profileHint(email) {
      const u = MOCK_USERS.find((x) => x.email === email);
      return u ? { name: u.name, institution: u.institution } : null;
    },
  };

  const impl = () => (env().USE_MOCK ? mockAuth : httpAuth);

  /* ─── Sesión ────────────────────────────────────────────────────────────── */
  function isExpired(session) {
    const exp = Date.parse(session && session.expiresAt);
    return !(exp > Date.now());
  }

  function clearSession() {
    remove(SESSION_KEY);
    remove(LEGACY_SESSION_KEY);
  }

  /** Sesión vigente o null. Si venció (o está corrupta) la cierra. */
  function getSession() {
    const session = read(SESSION_KEY, null);
    if (!session) return null;
    if (!session.token || !session.user || isExpired(session)) { clearSession(); return null; }
    return session;
  }

  function nameFromEmail(email) {
    return email.split("@")[0].split(/[._-]+/).filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  /* Refleja el login en la sesión heredada que usan el guardián y los paneles. */
  function syncLegacySession(res, email, role, remember) {
    const users = read(LEGACY_USERS_KEY, []);
    const hint = impl().profileHint(email);
    let user = users.find((u) => String(u.email || "").toLowerCase() === email);
    if (!user) {
      user = {
        id: res.userId, name: (hint && hint.name) || nameFromEmail(email), email,
        institution: (hint && hint.institution) || "",
        bloodType: null, document: "", city: "",
        donations: 0, points: 0, streak: 0, enrollments: [], enrollmentSlots: {}, history: [],
        createdAt: new Date().toISOString(),
      };
      users.push(user);
    }
    user.role = role;
    user.institutionId = res.institutionId || null;
    write(LEGACY_USERS_KEY, users);
    write(LEGACY_SESSION_KEY, { userId: user.id, remember: !!remember });
    return user;
  }

  /* ─── API pública ───────────────────────────────────────────────────────── */

  /** Inicia sesión. Resuelve { user, role } o rechaza con { status, code, message, timestamp }. */
  async function login(email, password, remember) {
    const req = { email: String(email || "").trim().toLowerCase(), password: String(password || "") };
    if (!validateLogin(req).ok) throw apiError(400, "VALIDATION_ERROR");

    const res = await impl().login(req);
    if (!res || res.valid === false || !res.token) throw apiError(401, "INVALID_CREDENTIALS");

    const role = internalRole(res.roles);
    if (!role) throw apiError(403, "ROLE_NOT_SUPPORTED");

    const legacyUser = syncLegacySession(res, req.email, role, remember);
    const session = {
      token: res.token,
      expiresAt: res.expiresAt,
      user: {
        userId: res.userId, email: req.email, name: legacyUser.name,
        roles: res.roles.slice(), institutionId: res.institutionId || null,
      },
    };
    write(SESSION_KEY, session);
    return { user: session.user, role };
  }

  function logout() { clearSession(); }

  /** Solicita el restablecimiento. No revela si el correo existe. */
  async function forgotPassword(email) {
    const value = String(email || "").trim().toLowerCase();
    if (validateEmail(value)) throw apiError(400, "VALIDATION_ERROR");
    await impl().forgotPassword(value);
    return { ok: true };
  }

  V.authService = {
    login, logout, forgotPassword,
    getSession, isAuthenticated: () => !!getSession(),
    validateLogin, validateEmail, messageFor,
    internalRole, roleLabel,
    SESSION_KEY, MOCK_USERS, MOCK_PASSWORD,
  };
})();
