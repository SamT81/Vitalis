/* =============================================================================
   Vitalis · RIBAS — SISTEMA DE AUTENTICACIÓN Y ROLES SIMULADO (js/auth.js)
   -----------------------------------------------------------------------------
   Simula registro, inicio de sesión, sesión y roles usando localStorage.
   Se carga ANTES de js/main.js / js/panel.js / js/admin.js y expone la API en
   `window.Vitalis.auth`.

   Claves de almacenamiento:
     vitalis_users    → cuentas registradas (incluye 3 cuentas demo con rol)
     vitalis_session  → { userId, remember } de la sesión activa

   Roles: "donante" (B2C) · "institucion" (B2B) · "admin" (SaaS / regulador).
   ============================================================================= */

(function () {
  "use strict";

  const USERS_KEY   = "vitalis_users";
  const SESSION_KEY = "vitalis_session";

  const read  = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
  const write = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  /* ─── Cuentas de demostración (se crean la primera vez) ─────────────────── */
  const DEMO = { email: "ana@vitalis.co", password: "demo1234" };
  const DEMO_ACCOUNTS = [
    { email: "banco@vitalis.co", password: "demo1234", role: "institucion" },
    { email: "admin@vitalis.co", password: "demo1234", role: "admin" },
  ];

  function ensureSeed() {
    const users = read(USERS_KEY, []);
    let changed = false;

    if (!users.some((u) => u.email === DEMO.email)) {
      users.push({
        id: "U-DEMO", name: "Ana García Solano", email: DEMO.email, password: DEMO.password,
        role: "donante",
        bloodType: "O+", document: "1032456789", city: "Bogotá",
        phone: "", address: "", birthdate: "",
        donations: 18, points: 2400, streak: 6,
        enrollments: ["C-003"], enrollmentSlots: { "C-003": "07:30" },
        history: [
          { cert: "DN-2026-118", date: "19 ago 2026", place: "Fundación Santa Fe de Bogotá",                component: "Glóbulos rojos", status: "usada" },
          { cert: "DN-2026-096", date: "22 may 2026", place: "Cruz Roja Colombiana, Seccional Cundinamarca", component: "Plasma",        status: "procesada" },
          { cert: "DN-2026-071", date: "14 feb 2026", place: "Jornada Universidad Javeriana",                component: "Sangre total",   status: "en_reserva" },
        ],
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      changed = true;
    }

    if (!users.some((u) => u.email === "banco@vitalis.co")) {
      users.push({
        id: "U-BANCO", name: "Laura Méndez", email: "banco@vitalis.co", password: "demo1234",
        role: "institucion", institution: "Fundación Santa Fe de Bogotá",
        bloodType: "", document: "", city: "Bogotá",
        donations: 0, points: 0, streak: 0, enrollments: [], enrollmentSlots: {}, history: [],
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      changed = true;
    }
    if (!users.some((u) => u.email === "admin@vitalis.co")) {
      users.push({
        id: "U-ADMIN", name: "Central Vitalis", email: "admin@vitalis.co", password: "demo1234",
        role: "admin",
        bloodType: "", document: "", city: "",
        donations: 0, points: 0, streak: 0, enrollments: [], enrollmentSlots: {}, history: [],
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      changed = true;
    }

    if (changed) write(USERS_KEY, users);
  }
  ensureSeed();

  /* ─── Lectura / escritura de usuarios y sesión ──────────────────────────── */
  const getUsers  = () => read(USERS_KEY, []);
  const saveUsers = (u) => write(USERS_KEY, u);
  const getSession = () => read(SESSION_KEY, null);

  function getUser() {
    const s = getSession();
    if (!s) return null;
    return getUsers().find((u) => u.id === s.userId) || null;
  }

  function saveUser(user) {
    const users = getUsers();
    const i = users.findIndex((u) => u.id === user.id);
    if (i >= 0) { users[i] = user; saveUsers(users); }
  }

  const isAuthenticated = () => !!getUser();
  const getRole = () => { const u = getUser(); return u ? (u.role || "donante") : null; };
  const hasRole = (...roles) => roles.includes(getRole());
  const initials = (name) => String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();

  /* ─── Registro / login / logout ────────────────────────────────────────── */
  function register(data) {
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: "Ya existe una cuenta registrada con ese correo." };
    }
    const user = {
      id: "U-" + Date.now().toString(36),
      name: data.name.trim(), email: data.email.trim(), password: data.password,
      role: "donante",
      // OA-01 · datos mínimos obligatorios
      bloodType: data.bloodType, document: data.document.trim(), city: data.city.trim(),
      // OA-02 · campos opcionales
      phone: (data.phone || "").trim(),
      address: (data.address || "").trim(),
      birthdate: (data.birthdate || "").trim(),
      donations: 0, points: 100, streak: 0,
      enrollments: [], enrollmentSlots: {}, history: [],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    write(SESSION_KEY, { userId: user.id, remember: true });
    return { ok: true, user };
  }

  function login(email, password, remember) {
    const user = getUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== password) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    write(SESSION_KEY, { userId: user.id, remember: !!remember });
    return { ok: true, user };
  }

  function logout() { try { localStorage.removeItem(SESSION_KEY); } catch {} }

  /* ─── Inscripción a campañas (con turno) ───────────────────────────────── */
  const isEnrolled = (id) => { const u = getUser(); return !!u && u.enrollments.includes(id); };
  const getEnrollmentSlot = (id) => { const u = getUser(); return u && u.enrollmentSlots ? u.enrollmentSlots[id] : null; };

  /** Alterna la inscripción del usuario. Devuelve {ok, enrolled} o {ok:false, needAuth:true}. */
  function toggleEnrollment(id, slot) {
    const u = getUser();
    if (!u) return { ok: false, needAuth: true };
    u.enrollmentSlots = u.enrollmentSlots || {};
    const i = u.enrollments.indexOf(id);
    if (i >= 0) {
      u.enrollments.splice(i, 1);
      delete u.enrollmentSlots[id];
    } else {
      u.enrollments.push(id);
      if (slot) u.enrollmentSlots[id] = slot;
    }
    saveUser(u);
    return { ok: true, enrolled: i < 0, slot: u.enrollmentSlots[id] || null };
  }

  /* ─── Estado visual (navbar / bloques por rol) ─────────────────────────── */
  function setDocAuthState() {
    document.documentElement.dataset.auth = isAuthenticated() ? "user" : "guest";
    document.documentElement.dataset.role = getRole() || "";
  }

  function paintUI() {
    setDocAuthState();
    const u = getUser();
    const role = getRole();
    const guard = window.Vitalis && window.Vitalis.guard;
    document.querySelectorAll("[data-auth-name]").forEach((el) => { el.textContent = u ? u.name : ""; });
    document.querySelectorAll("[data-auth-firstname]").forEach((el) => { el.textContent = u ? u.name.split(/\s+/)[0] : ""; });
    document.querySelectorAll("[data-auth-initials]").forEach((el) => { el.textContent = u ? initials(u.name) : "··"; });
    // Bloques restringidos por rol: data-role="institucion admin"
    document.querySelectorAll("[data-role]").forEach((el) => {
      const need = el.dataset.role.split(/\s+/).filter(Boolean);
      const ok = need.some((n) => (guard && guard.roleCovers) ? guard.roleCovers(n) : (role && n === role));
      el.hidden = !ok;
    });
  }

  function initLogoutButtons() {
    document.querySelectorAll("[data-auth-logout]").forEach((btn) => {
      btn.addEventListener("click", (e) => { e.preventDefault(); logout(); location.href = "index.html"; });
    });
  }

  /* ─── Formularios de login / registro ─────────────────────────────────── */
  const ALLOWED_NEXT = [
    "perfil.html", "campanas.html", "index.html", "gamificacion.html",
    "informacion.html", "panel-institucional.html", "admin-dashboard.html",
  ];
  const HOME_BY_ROLE = { SUPER_ADMIN: "admin-dashboard.html", admin: "admin-dashboard.html", institucion: "panel-institucional.html", donante: "perfil.html" };

  function nextTarget() {
    const p = new URLSearchParams(location.search).get("next");
    if (ALLOWED_NEXT.includes(p)) return p;
    return HOME_BY_ROLE[getRole()] || "perfil.html";
  }
  function showFormError(el, msg) { if (!el) return; el.textContent = msg; el.classList.add("show"); }

  function initAuthForms() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      const err = document.getElementById("login-error");
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        err && err.classList.remove("show");
        loginForm.classList.add("was-validated");
        if (!loginForm.checkValidity()) return;
        const res = login(
          document.getElementById("login-email").value,
          document.getElementById("login-password").value,
          document.getElementById("login-remember") && document.getElementById("login-remember").checked
        );
        if (!res.ok) { showFormError(err, res.error); return; }
        location.href = nextTarget();
      });
      document.querySelectorAll("[data-demo-login]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const email = btn.dataset.demoLogin || DEMO.email;
          login(email, "demo1234", true);
          location.href = nextTarget();
        });
      });
    }

    const regForm = document.getElementById("register-form");
    if (regForm) {
      const err = document.getElementById("register-error");
      regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        err && err.classList.remove("show");
        regForm.classList.add("was-validated");
        if (!regForm.checkValidity()) return;
        const val = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
        const res = register({
          name: val("reg-name"), email: val("reg-email"), password: val("reg-password"),
          bloodType: val("reg-blood"), document: val("reg-doc"), city: val("reg-city"),
          phone: val("reg-phone"), address: val("reg-address"), birthdate: val("reg-birthdate"),
        });
        if (!res.ok) { showFormError(err, res.error); return; }
        location.href = "perfil.html";
      });
    }
  }

  /* La protección de páginas privadas la gestiona js/auth-guard.js (cargado en
     el <head>). En modo desarrollo NO redirige; permite la navegación libre. */

  /* ─── API pública ──────────────────────────────────────────────────────── */
  window.Vitalis = window.Vitalis || {};
  window.Vitalis.auth = {
    getUser, isAuthenticated, getRole, hasRole, initials,
    register, login, logout,
    isEnrolled, getEnrollmentSlot, toggleEnrollment, saveUser,
    DEMO, DEMO_ACCOUNTS,
  };

  function onReady() { paintUI(); initLogoutButtons(); initAuthForms(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
