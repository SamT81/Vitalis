/* =============================================================================
   Vitalis · RIBAS — SISTEMA DE AUTENTICACIÓN Y ROLES SIMULADO (js/auth.js)
   -----------------------------------------------------------------------------
   Simula registro, inicio de sesión, sesión y roles usando localStorage.
   Se carga DESPUÉS de js/auth-guard.js y ANTES de js/main.js / js/panel.js /
   js/admin.js / js/operativo.js / … y expone la API en `window.Vitalis.auth`.

   Claves de almacenamiento:
     vitalis_users    → cuentas registradas (incluye las cuentas demo por rol)
     vitalis_session  → { userId, remember } de la sesión activa

   Roles del sistema (ver SRS), de menor a mayor alcance:
     donante              → auto-registro público · panel en perfil.html
     operativo            → personal de banco de sangre / centro de salud
     admin_institucional  → administrador de una sede/tenant
     auditor              → auditor regulatorio INVIMA (transversal, solo lectura)
     admin_general        → superusuario del sistema (Vitalis)
   Sólo "donante" se auto-registra; las cuentas de personal las crea un
   administrador, por eso aquí sólo existen como cuentas semilla de demostración.

   Roles heredados (versiones previas), remapeados al arrancar:
     institucion → admin_institucional      admin → admin_general
   ============================================================================= */

(function () {
  "use strict";

  const USERS_KEY   = "vitalis_users";
  const SESSION_KEY = "vitalis_session";

  const read  = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
  const write = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const guard = () => (window.Vitalis && window.Vitalis.guard) || null;

  /* ─── Metadatos de roles ────────────────────────────────────────────────── */
  const ROLE_LABEL = {
    donante:             "Donante",
    operativo:           "Personal Operativo",
    admin_institucional: "Admin. Institucional",
    auditor:             "Auditor INVIMA",
    admin_general:       "Admin. General",
    SUPER_ADMIN:         "Dev · SuperAdmin",
  };

  const ROLE_ICON = {
    donante:             "user-round",
    operativo:           "clipboard-list",
    admin_institucional: "building-2",
    auditor:             "shield-check",
    admin_general:       "server-cog",
    SUPER_ADMIN:         "terminal",
  };

  const ROLE_HOME = {
    donante:             "perfil.html",
    operativo:           "operativo.html",
    admin_institucional: "panel-institucional.html",
    auditor:             "auditoria.html",
    admin_general:       "admin-dashboard.html",
    SUPER_ADMIN:         "index.html",
  };

  /* Orden del selector de rol simulado (navbar + login). */
  const ROLE_ORDER = ["donante", "operativo", "admin_institucional", "auditor", "admin_general"];

  /* Remapeo de tokens heredados → tokens nuevos. */
  const LEGACY_ROLE = { institucion: "admin_institucional", admin: "admin_general" };

  /* ─── Cuentas de demostración (se crean la primera vez, una por rol) ────── */
  const DEMOS = {
    donante:             { email: "ana@vitalis.co",        password: "demo1234" },
    operativo:           { email: "carlos@ribas.co",       password: "demo1234" },
    admin_institucional: { email: "laura@ribas.co",        password: "demo1234" },
    auditor:             { email: "invima@ribas.co",       password: "demo1234" },
    admin_general:       { email: "superadmin@vitalis.co", password: "demo1234" },
  };
  const DEMO = DEMOS.donante; // alias retrocompatible

  const HOME_INSTITUTION = "Cruz Roja Colombiana, Seccional Cundinamarca";

  function ensureSeed() {
    const users = read(USERS_KEY, []);
    let changed = false;
    const addIfMissing = (user) => {
      if (users.some((u) => u.email === user.email)) return;
      users.push(user);
      changed = true;
    };

    addIfMissing({
      id: "U-DEMO", name: "Ana García Solano", email: DEMOS.donante.email, password: DEMOS.donante.password,
      role: "donante",
      bloodType: "O+", document: "1032456789", city: "Bogotá",
      phone: "", address: "", birthdate: "",
      donations: 18, points: 2400, streak: 6,
      enrollments: ["C-003"], enrollmentSlots: { "C-003": "07:30" },
      history: [
        { cert: "DN-2026-118", date: "19 ago 2026", place: "Fundación Santa Fe de Bogotá",                component: "Glóbulos rojos", status: "usada" },
        { cert: "DN-2026-096", date: "22 may 2026", place: "Cruz Roja Colombiana, Seccional Cundinamarca", component: "Plasma",         status: "procesada" },
        { cert: "DN-2026-071", date: "14 feb 2026", place: "Jornada Universidad Javeriana",                component: "Sangre total",   status: "en_reserva" },
      ],
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    addIfMissing({
      id: "U-DEMO-OP", name: "Carlos Ramírez Peña", email: DEMOS.operativo.email, password: DEMOS.operativo.password,
      role: "operativo",
      institution: HOME_INSTITUTION, jobTitle: "Auxiliar de banco de sangre",
      bloodType: null, document: "1019345678", city: "Bogotá",
      donations: 0, points: 0, streak: 0, enrollments: [], enrollmentSlots: {}, history: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    addIfMissing({
      id: "U-DEMO-ADMIN-INST", name: "Laura Jiménez Rojas", email: DEMOS.admin_institucional.email, password: DEMOS.admin_institucional.password,
      role: "admin_institucional",
      institution: HOME_INSTITUTION,
      bloodType: null, document: "1019876543", city: "Bogotá",
      donations: 0, points: 0, streak: 0, enrollments: [], enrollmentSlots: {}, history: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    addIfMissing({
      id: "U-DEMO-AUDITOR", name: "María Fernanda Ospina", email: DEMOS.auditor.email, password: DEMOS.auditor.password,
      role: "auditor",
      institution: "INVIMA — Instituto Nacional de Vigilancia de Medicamentos y Alimentos",
      bloodType: null, document: "1020112233", city: "Bogotá",
      donations: 0, points: 0, streak: 0, enrollments: [], enrollmentSlots: {}, history: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    addIfMissing({
      id: "U-DEMO-SUPERADMIN", name: "Julián Torres Medina", email: DEMOS.admin_general.email, password: DEMOS.admin_general.password,
      role: "admin_general",
      institution: "Vitalis · RIBAS (Sistema)",
      bloodType: null, document: "1020998877", city: "Bogotá",
      donations: 0, points: 0, streak: 0, enrollments: [], enrollmentSlots: {}, history: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    /* Cuentas heredadas: se mantienen como alias para no romper enlaces viejos. */
    addIfMissing({
      id: "U-BANCO", name: "Laura Méndez", email: "banco@vitalis.co", password: "demo1234",
      role: "admin_institucional", institution: "Fundación Santa Fe de Bogotá",
      bloodType: "", document: "", city: "Bogotá",
      donations: 0, points: 0, streak: 0, enrollments: [], enrollmentSlots: {}, history: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    addIfMissing({
      id: "U-ADMIN", name: "Central Vitalis", email: "admin@vitalis.co", password: "demo1234",
      role: "admin_general",
      bloodType: "", document: "", city: "",
      donations: 0, points: 0, streak: 0, enrollments: [], enrollmentSlots: {}, history: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    if (changed) write(USERS_KEY, users);
  }
  ensureSeed();

  /** Migra cuentas previas al sistema de roles actual:
      sin `role` → "donante"; tokens heredados → tokens nuevos. */
  function migrateRoles() {
    const users = read(USERS_KEY, []);
    let changed = false;
    users.forEach((u) => {
      if (!u.role) { u.role = "donante"; changed = true; }
      else if (LEGACY_ROLE[u.role]) { u.role = LEGACY_ROLE[u.role]; changed = true; }
    });
    if (changed) write(USERS_KEY, users);
  }
  migrateRoles();

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
  const rawRole = () => { const u = getUser(); return u ? (u.role || "donante") : null; };
  /** Rol efectivo: el usuario Dev (SUPER_ADMIN) se comporta como admin_general. */
  const getRole = () => { const r = rawRole(); return r === "SUPER_ADMIN" ? "admin_general" : r; };
  const hasRole = (...roles) => roles.includes(rawRole()) || roles.includes(getRole());
  const roleLabel = (role) => ROLE_LABEL[role || rawRole()] || "—";
  const initials = (name) => String(name || "").trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();

  /* ─── Registro / login / logout ────────────────────────────────────────── */
  // El auto-registro público es exclusivo del rol Donante (SRS): el personal
  // operativo, los administradores institucionales, los auditores INVIMA y el
  // administrador general no se auto-registran, sus cuentas las crea un admin.
  function register(data) {
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: "Ya existe una cuenta registrada con ese correo." };
    }
    const user = {
      id: "U-" + Date.now().toString(36),
      name: data.name.trim(), email: data.email.trim(), password: data.password,
      role: "donante",
      bloodType: data.bloodType, document: data.document.trim(), city: data.city.trim(),
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

  /** Inicia sesión con la cuenta de demostración del rol indicado. */
  function loginAsDemo(role) {
    const demo = DEMOS[role];
    if (!demo) return { ok: false, error: "Rol de demostración inválido." };
    return login(demo.email, demo.password, true);
  }

  /** Página de destino tras iniciar sesión, según el rol. */
  function roleHome(role) { return ROLE_HOME[role] || "perfil.html"; }

  function logout() { try { localStorage.removeItem(SESSION_KEY); } catch {} }

  /* ─── Selector / simulador de rol (navbar y login) ──────────────────────
     Cambiar de rol = iniciar sesión con la cuenta demo de ese rol. Así cada
     panel recibe una sesión coherente (institución, inventario, permisos)
     sin tocar el usuario Dev. */
  function setSimulatedRole(role) {
    const res = loginAsDemo(role);
    if (!res.ok) return res;
    location.href = roleHome(role);
    return res;
  }

  /* ─── Inscripción a campañas (con turno) ───────────────────────────────── */
  const isEnrolled = (id) => { const u = getUser(); return !!u && Array.isArray(u.enrollments) && u.enrollments.includes(id); };
  const getEnrollmentSlot = (id) => { const u = getUser(); return u && u.enrollmentSlots ? u.enrollmentSlots[id] : null; };

  function toggleEnrollment(id, slot) {
    const u = getUser();
    if (!u) return { ok: false, needAuth: true };
    u.enrollments = u.enrollments || [];
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
    document.documentElement.dataset.role = rawRole() || "";
  }

  function paintUI() {
    setDocAuthState();
    const u = getUser();
    const role = rawRole();
    const g = guard();

    document.querySelectorAll("[data-auth-name]").forEach((el) => { el.textContent = u ? u.name : ""; });
    document.querySelectorAll("[data-auth-firstname]").forEach((el) => { el.textContent = u ? u.name.split(/\s+/)[0] : ""; });
    document.querySelectorAll("[data-auth-initials]").forEach((el) => { el.textContent = u ? initials(u.name) : "··"; });
    document.querySelectorAll("[data-auth-role-label]").forEach((el) => { el.textContent = u ? roleLabel(role) : ""; });
    document.querySelectorAll("[data-auth-institution]").forEach((el) => { el.textContent = (u && u.institution) || ""; });

    // Bloques restringidos por rol: data-role="admin_institucional admin_general"
    document.querySelectorAll("[data-role]").forEach((el) => {
      const need = el.dataset.role.split(/\s+/).filter(Boolean);
      const ok = need.some((n) => (g && g.roleCovers) ? g.roleCovers(n) : (role && n === role));
      el.hidden = !ok;
    });

    // Elementos sólo visibles en modo desarrollo.
    const devOn = !!(g && g.DEV_MODE);
    document.querySelectorAll("[data-dev-only]").forEach((el) => { el.hidden = !devOn; });
    document.querySelectorAll("[data-dev-state]").forEach((el) => { el.textContent = devOn ? "activo" : "apagado"; });
  }

  /* Rellena el menú "Simular rol" del avatar en la navbar. */
  function buildRoleSwitcher() {
    document.querySelectorAll("[data-role-switcher]").forEach((wrap) => {
      const current = getRole();
      wrap.innerHTML = ROLE_ORDER.map((r) => `
        <button type="button" class="nrd-role ${r === current ? "is-current" : ""}" data-sim-role="${r}">
          <i data-lucide="${ROLE_ICON[r]}"></i>
          <span>${ROLE_LABEL[r]}</span>
          ${r === current ? '<i data-lucide="check" class="nrd-role-check"></i>' : ""}
        </button>`).join("");
      wrap.querySelectorAll("[data-sim-role]").forEach((btn) => {
        btn.addEventListener("click", (e) => { e.preventDefault(); setSimulatedRole(btn.dataset.simRole); });
      });
    });
  }

  function initNavMenu() {
    const g = guard();
    // Botón "Modo Dev": enciende / apaga el guardián de desarrollo.
    document.querySelectorAll("[data-dev-toggle]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (g && g.setDevMode) g.setDevMode(!g.DEV_MODE);
      });
    });
    buildRoleSwitcher();
  }

  function initLogoutButtons() {
    document.querySelectorAll("[data-auth-logout]").forEach((btn) => {
      btn.addEventListener("click", (e) => { e.preventDefault(); logout(); location.href = "index.html"; });
    });
  }

  /* ─── Formularios de login / registro ─────────────────────────────────── */
  const ALLOWED_NEXT = [
    "perfil.html", "campanas.html", "index.html", "gamificacion.html", "informacion.html",
    "panel-institucional.html", "admin-dashboard.html",
    "operativo.html", "admin-institucional.html", "auditoria.html", "admin-general.html",
  ];

  /** Respeta ?next= si es una página conocida; si no, cae al home del rol dado. */
  function nextTarget(fallback) {
    const p = new URLSearchParams(location.search).get("next");
    if (ALLOWED_NEXT.includes(p)) return p;
    return fallback || "perfil.html";
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
        location.href = nextTarget(roleHome(res.user.role));
      });

      // Botón demo genérico (login.html) — el rol lo fija el selector de pills.
      const demoBtn = document.getElementById("login-demo");
      if (demoBtn) demoBtn.addEventListener("click", () => {
        const role = demoBtn.dataset.role || "donante";
        const res = loginAsDemo(role);
        if (!res.ok) return;
        location.href = nextTarget(roleHome(role));
      });

      // Botones demo explícitos por correo (compatibilidad).
      document.querySelectorAll("[data-demo-login]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const res = login(btn.dataset.demoLogin || DEMO.email, "demo1234", true);
          if (!res.ok) return;
          location.href = nextTarget(roleHome(res.user.role));
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

  /* ─── Protección de páginas privadas ─────────────────────────────────────
     Cada panel declara en <body data-requires-auth="true"
     data-requires-role="operativo,admin_general"> qué rol(es) puede verlo.
     En MODO DESARROLLO (guard.DEV_MODE) nunca redirige: se navega libre.
     En producción, sin sesión o con rol no cubierto → login.html?next=<pagina>. */
  function guardProtectedPage() {
    const g = guard();
    if (g && g.DEV_MODE) return;                         // dev: acceso libre
    const body = document.body;
    if (!body || body.dataset.requiresAuth !== "true") return;

    const page = (location.pathname.split("/").pop() || "perfil.html");
    const user = getUser();
    if (!user) { location.replace("login.html?next=" + encodeURIComponent(page)); return; }

    const requiredRole = body.dataset.requiresRole;
    if (!requiredRole) return;
    const allowed = requiredRole.split(",").map((r) => r.trim()).filter(Boolean);
    const ok = allowed.some((r) => r === user.role || (g && g.roleCovers && g.roleCovers(r)));
    if (!ok) location.replace("login.html?next=" + encodeURIComponent(page));
  }

  /* ─── API pública ──────────────────────────────────────────────────────── */
  window.Vitalis = window.Vitalis || {};
  window.Vitalis.auth = {
    getUser, isAuthenticated, getRole, hasRole, initials, roleLabel,
    register, login, loginAsDemo, logout, roleHome, setSimulatedRole,
    isEnrolled, getEnrollmentSlot, toggleEnrollment, saveUser,
    ROLE_LABEL, ROLE_ICON, ROLE_ORDER, ROLE_HOME,
    DEMO, DEMOS,
  };

  guardProtectedPage();

  function onReady() { paintUI(); initNavMenu(); initLogoutButtons(); initAuthForms(); if (window.lucide) window.lucide.createIcons(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
