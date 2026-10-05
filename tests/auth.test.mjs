/* Pruebas del módulo de autenticación. Ejecutar con:  node --test tests/
   Cargan los scripts del navegador en un contexto aislado con localStorage simulado. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const source = (file) => readFileSync(new URL(file, root), "utf8");

function createBrowser({ page = "login.html", storage = {}, fetchImpl } = {}) {
  const store = new Map(Object.entries(storage));
  const attrs = {};
  const ctx = {
    console, setTimeout, clearTimeout, Date, JSON, Math, Promise, AbortController, btoa, URLSearchParams,
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: (k) => { store.delete(k); },
    },
    location: {
      pathname: "/" + page, search: "", redirectedTo: null,
      replace(url) { this.redirectedTo = url; },
      reload() {},
    },
    document: { documentElement: { setAttribute: (k, v) => { attrs[k] = v; } } },
    fetch: fetchImpl || (() => Promise.reject(new Error("sin red"))),
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  const load = (...files) => files.forEach((f) => vm.runInContext(source(f), ctx, { filename: f }));
  const json = (k) => JSON.parse(ctx.localStorage.getItem(k));
  return { ctx, load, json, attrs, store };
}

function createApp(options) {
  const browser = createBrowser(options);
  browser.load("js/env.js", "js/http-client.js", "js/auth-service.js");
  browser.ctx.Vitalis.env.MOCK_DELAY_MS = 0;
  return { ...browser, svc: browser.ctx.Vitalis.authService, env: browser.ctx.Vitalis.env };
}

const rejection = async (promise) => {
  let error = null;
  try { await promise; } catch (e) { error = e; }
  assert.ok(error, "se esperaba un rechazo");
  return error;
};

test("validación del formulario de login", () => {
  const { svc } = createApp();
  assert.equal(svc.validateLogin({ email: "", password: "" }).ok, false);
  assert.ok(svc.validateLogin({ email: "correo-invalido", password: "Ribas2026!" }).errors.email);
  assert.ok(svc.validateLogin({ email: "a@b", password: "Ribas2026!" }).errors.email);
  assert.match(svc.validateLogin({ email: "a@b.co", password: "corta" }).errors.password, /al menos 8/);
  assert.equal(svc.validateLogin({ email: "a@b.co", password: "Ribas2026!" }).ok, true);
});

test("login exitoso con mock: respuesta del contrato, sesión y sesión heredada", async () => {
  const { svc, json } = createApp();
  const res = await svc.login("  Personal@BancoBogota.co ", "Ribas2026!", true);

  assert.equal(res.role, "operativo");
  assert.deepEqual(Array.from(res.user.roles), ["personal_banco_sangre"]);
  assert.equal(res.user.institutionId, "inst-uuid-bogota-01");

  const session = json("ribas_session");
  assert.deepEqual(Object.keys(session).sort(), ["expiresAt", "token", "user"]);
  assert.ok(session.token.startsWith("mock."));
  assert.ok(Date.parse(session.expiresAt) > Date.now());
  assert.equal(svc.isAuthenticated(), true);

  const legacyUser = json("vitalis_users").find((u) => u.email === "personal@bancobogota.co");
  assert.equal(legacyUser.role, "operativo");
  assert.equal(legacyUser.password, undefined);
  assert.equal(json("vitalis_session").userId, legacyUser.id);
});

test("cada usuario de prueba entra con el rol interno esperado", async () => {
  const expected = {
    "superadmin@vitalis.co": "admin_general",
    "admin.nacional@ribas.co": "admin_general",
    "admin@bancobogota.co": "admin_institucional",
    "personal@bancobogota.co": "operativo",
    "logistica@bancobogota.co": "operativo",
    "auditor@invima.gov.co": "auditor",
    "donante@gmail.com": "donante",
  };
  for (const [email, role] of Object.entries(expected)) {
    const { svc } = createApp();
    assert.equal((await svc.login(email, "Ribas2026!")).role, role, email);
  }
});

test("las cuentas locales existentes (demo / registradas) siguen entrando", async () => {
  const users = [{ id: "U-DEMO", name: "Ana García Solano", email: "ana@vitalis.co", password: "demo1234", role: "donante" }];
  const { svc, json } = createApp({ storage: { vitalis_users: JSON.stringify(users) } });
  const res = await svc.login("ana@vitalis.co", "demo1234");
  assert.equal(res.role, "donante");
  assert.equal(res.user.name, "Ana García Solano");
  assert.equal(json("vitalis_session").userId, "U-DEMO");
});

test("credenciales incorrectas → 401 INVALID_CREDENTIALS con mensaje en español", async () => {
  const { svc, json } = createApp();
  const error = await rejection(svc.login("donante@gmail.com", "incorrecta1"));
  assert.equal(error.status, 401);
  assert.equal(error.code, "INVALID_CREDENTIALS");
  assert.ok(error.timestamp);
  assert.equal(svc.messageFor(error), "El correo o la contraseña son incorrectos.");
  assert.equal(json("ribas_session"), null);
});

test("bloqueo temporal tras 5 intentos fallidos → 429 ACCOUNT_LOCKED", async () => {
  const { svc } = createApp();
  for (let i = 0; i < 5; i++) {
    assert.equal((await rejection(svc.login("donante@gmail.com", "incorrecta1"))).code, "INVALID_CREDENTIALS");
  }
  const locked = await rejection(svc.login("donante@gmail.com", "Ribas2026!"));
  assert.equal(locked.status, 429);
  assert.equal(locked.code, "ACCOUNT_LOCKED");
  assert.equal(svc.messageFor(locked), "Demasiados intentos. Intenta de nuevo en unos minutos.");
  // El bloqueo es por cuenta: otro usuario no se ve afectado.
  assert.equal((await svc.login("auditor@invima.gov.co", "Ribas2026!")).role, "auditor");
});

test("cuenta deshabilitada → USER_DISABLED", async () => {
  const { svc } = createApp();
  const error = await rejection(svc.login("inactivo@bancobogota.co", "Ribas2026!"));
  assert.equal(error.status, 403);
  assert.equal(error.code, "USER_DISABLED");
});

test("la sesión vencida se cierra al restaurarla", () => {
  const expired = { token: "t", expiresAt: "2020-01-01T00:00:00Z", user: { userId: "u", roles: ["donante"] } };
  const { svc, json } = createApp({
    storage: { ribas_session: JSON.stringify(expired), vitalis_session: JSON.stringify({ userId: "u" }) },
  });
  assert.equal(svc.getSession(), null);
  assert.equal(json("ribas_session"), null);
  assert.equal(json("vitalis_session"), null);
});

test("logout borra el token y la sesión", async () => {
  const { svc, json } = createApp();
  await svc.login("donante@gmail.com", "Ribas2026!");
  svc.logout();
  assert.equal(json("ribas_session"), null);
  assert.equal(json("vitalis_session"), null);
});

test("backend real: llama al contrato del DD y traduce errores y caída de red", async () => {
  const calls = [];
  const response = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
  let next = () => response(200, {
    valid: true, userId: "usr-uuid-1234-5678", institutionId: "inst-uuid-bogota-01",
    roles: ["banco_sangre_admin"], token: "jwt-real", expiresAt: "2099-12-31T23:59:59Z",
  });
  const app = createApp({ fetchImpl: async (url, init) => { calls.push({ url, init }); return next(); } });
  app.env.USE_MOCK = false;

  const res = await app.svc.login("juan.perez@invima.gov.co", "Ribas2026!");
  assert.equal(calls[0].url, "http://localhost:8000/api/v1/auth/login");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].init.body), { email: "juan.perez@invima.gov.co", password: "Ribas2026!" });
  assert.equal(calls[0].init.headers.Authorization, undefined);
  assert.equal(res.role, "admin_institucional");
  assert.equal(res.user.name, "Juan Perez");

  // Las peticiones protegidas llevan el token
  next = () => response(200, { ok: true });
  await app.ctx.Vitalis.http.get("/api/v1/institutions/inst-uuid-bogota-01");
  assert.equal(calls[1].init.headers.Authorization, "Bearer jwt-real");

  // 401 en una petición autenticada: cierra sesión y manda a login
  next = () => response(401, { code: "TOKEN_EXPIRED", message: "x", timestamp: "t" });
  app.ctx.location.pathname = "/operativo.html";
  await rejection(app.ctx.Vitalis.http.get("/api/v1/inventory/stock"));
  assert.equal(app.json("ribas_session"), null);
  assert.equal(app.ctx.location.redirectedTo, "login.html?next=operativo.html");

  next = () => response(401, { code: "INVALID_CREDENTIALS", message: "x", timestamp: "t" });
  assert.equal((await rejection(app.svc.login("a@b.co", "Ribas2026!"))).code, "INVALID_CREDENTIALS");

  next = () => { throw new TypeError("Failed to fetch"); };
  const offline = await rejection(app.svc.login("a@b.co", "Ribas2026!"));
  assert.equal(offline.code, "NETWORK_ERROR");
  assert.equal(app.svc.messageFor(offline), "No hay conexión con el servidor.");

  next = () => response(500, {});
  assert.match(app.svc.messageFor(await rejection(app.svc.login("a@b.co", "Ribas2026!"))), /error inesperado/);
});

test("recuperar contraseña: valida el correo y confirma sin revelar si existe", async () => {
  const { svc } = createApp();
  assert.equal((await rejection(svc.forgotPassword("no-es-correo"))).code, "VALIDATION_ERROR");
  assert.equal((await svc.forgotPassword("nadie@ejemplo.co")).ok, true);
});

test("ruta protegida: sin sesión (o con sesión vencida) redirige a login", () => {
  const guest = createBrowser({ page: "cuenta.html", storage: { vitalis_devmode: "off" } });
  guest.load("js/auth-guard.js");
  assert.equal(guest.ctx.location.redirectedTo, "login.html?next=cuenta.html");
  assert.equal(guest.attrs["data-auth"], "guest");

  const users = [{ id: "u1", name: "Natalia", email: "p@b.co", role: "operativo" }];
  const base = { vitalis_devmode: "off", vitalis_users: JSON.stringify(users), vitalis_session: JSON.stringify({ userId: "u1" }) };

  const expired = createBrowser({ page: "operativo.html", storage: { ...base,
    ribas_session: JSON.stringify({ token: "t", expiresAt: "2020-01-01T00:00:00Z", user: {} }) } });
  expired.load("js/auth-guard.js");
  assert.equal(expired.ctx.location.redirectedTo, "login.html?next=operativo.html");

  const valid = createBrowser({ page: "operativo.html", storage: { ...base,
    ribas_session: JSON.stringify({ token: "t", expiresAt: "2099-01-01T00:00:00Z", user: {} }) } });
  valid.load("js/auth-guard.js");
  assert.equal(valid.ctx.location.redirectedTo, null);
  assert.equal(valid.attrs["data-role"], "operativo");
});

test("capa de datos: con USE_MOCK responde el mock sin llamar a la red", async () => {
  let called = 0;
  const browser = createBrowser({ fetchImpl: async () => { called++; return { ok: false, status: 404, json: async () => ({}) }; } });
  browser.load("js/env.js", "js/api-service.js");
  const res = await browser.ctx.Vitalis.api.InventoryService.listUnits();
  assert.equal(res.source, "mock");
  assert.equal(called, 0);

  browser.ctx.Vitalis.env.USE_MOCK = false;
  await browser.ctx.Vitalis.api.InventoryService.listUnits();
  assert.equal(called, 1);
});
