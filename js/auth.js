/* =============================================================================
   Vitalis · RIBAS — SISTEMA DE AUTENTICACIÓN SIMULADO (js/auth.js)
   -----------------------------------------------------------------------------
   Simula el registro, el inicio de sesión y la sesión del donante usando
   localStorage. Se carga ANTES de js/main.js en todas las páginas y expone la
   API en `window.Vitalis.auth`.

   Claves de almacenamiento:
     vitalis_users    → array de donantes registrados (incluye una cuenta demo)
     vitalis_session  → { userId, remember } del donante con sesión activa

   El estado del donante (puntos, donaciones, inscripciones, historial) se guarda
   dentro de su registro en `vitalis_users`.
   ============================================================================= */

(function () {
  "use strict";

  const USERS_KEY   = "vitalis_users";
  const SESSION_KEY = "vitalis_session";

  const read  = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
  const write = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  /* ─── Roles del sistema (ver SRS) ────────────────────────────────────────
     donante              → auto-registro público, panel en perfil.html
     operativo            → personal de banco de sangre / centro de salud
     admin_institucional  → administrador de una sede/tenant
     auditor              → auditor regulatorio INVIMA (transversal, solo lectura)
     admin_general        → superusuario del sistema (Vitalis)
     Solo "donante" se auto-registra; las cuentas staff las crea un administrador,
     por eso aquí solo existen como cuentas semilla de demostración. ────────── */
  const ROLE_HOME = {
    donante:              "perfil.html",
    operativo:            "operativo.html",
    admin_institucional:  "admin-institucional.html",
    auditor:              "auditoria.html",
    admin_general:        "admin-general.html",
  };

  /* ─── Cuentas de demostración (se crean la primera vez, una por rol) ────── */
  const DEMOS = {
    donante:             { email: "ana@vitalis.co",        password: "demo1234" },
    operativo:           { email: "carlos@ribas.co",       password: "demo1234" },
    admin_institucional: { email: "laura@ribas.co",        password: "demo1234" },
    auditor:             { email: "invima@ribas.co",       password: "demo1234" },
    admin_general:       { email: "superadmin@vitalis.co", password: "demo1234" },
  };
  const DEMO = DEMOS.donante; // alias retrocompatible

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
      donations: 18, points: 2400, streak: 6,
      enrollments: ["C-003"],
      history: [
        { cert: "DN-2026-118", date: "19 ago 2026", place: "Fundación Santa Fe de Bogotá",             component: "Glóbulos rojos", status: "usada" },
        { cert: "DN-2026-096", date: "22 may 2026", place: "Cruz Roja Colombiana, Seccional Cundinamarca", component: "Plasma",        status: "procesada" },
        { cert: "DN-2026-071", date: "14 feb 2026", place: "Jornada Universidad Javeriana",              component: "Sangre total",   status: "en_reserva" },
      ],
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    addIfMissing({
      id: "U-DEMO-OP", name: "Carlos Ramírez Peña", email: DEMOS.operativo.email, password: DEMOS.operativo.password,
      role: "operativo",
      institution: "Cruz Roja Colombiana, Seccional Cundinamarca", document: "1019345678", city: "Bogotá",
      bloodType: null, donations: 0, points: 0, streak: 0, enrollments: [], history: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    addIfMissing({
      id: "U-DEMO-ADMIN-INST", name: "Laura Jiménez Rojas", email: DEMOS.admin_institucional.email, password: DEMOS.admin_institucional.password,
      role: "admin_institucional",
      institution: "Cruz Roja Colombiana, Seccional Cundinamarca", document: "1019876543", city: "Bogotá",
      bloodType: null, donations: 0, points: 0, streak: 0, enrollments: [], history: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    addIfMissing({
      id: "U-DEMO-AUDITOR", name: "María Fernanda Ospina", email: DEMOS.auditor.email, password: DEMOS.auditor.password,
      role: "auditor",
      institution: "INVIMA — Instituto Nacional de Vigilancia de Medicamentos y Alimentos", document: "1020112233", city: "Bogotá",
      bloodType: null, donations: 0, points: 0, streak: 0, enrollments: [], history: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    addIfMissing({
      id: "U-DEMO-SUPERADMIN", name: "Julián Torres Medina", email: DEMOS.admin_general.email, password: DEMOS.admin_general.password,
      role: "admin_general",
      institution: "Vitalis · RIBAS (Sistema)", document: "1020998877", city: "Bogotá",
      bloodType: null, donations: 0, points: 0, streak: 0, enrollments: [], history: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    if (changed) write(USERS_KEY, users);
  }
  ensureSeed();

  /** Migra cuentas creadas antes del sistema de roles: sin `role` → "donante". */
  function migrateRoles() {
    const users = read(USERS_KEY, []);
    let changed = false;
    users.forEach((u) => { if (!u.role) { u.role = "donante"; changed = true; } });
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

  /** Persiste los cambios del usuario con sesión activa. */
  function saveUser(user) {
    const users = getUsers();
    const i = users.findIndex((u) => u.id === user.id);
    if (i >= 0) { users[i] = user; saveUsers(users); }
  }

  const isAuthenticated = () => !!getUser();
  const initials = (name) => String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();

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
      donations: 0, points: 100, streak: 0, enrollments: [], history: [],
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

  /** Página de destino tras iniciar sesión, según el rol del usuario. */
  function roleHome(role) { return ROLE_HOME[role] || "perfil.html"; }

  function logout() { try { localStorage.removeItem(SESSION_KEY); } catch {} }

  /* ─── Inscripción a campañas ───────────────────────────────────────────── */
  const isEnrolled = (id) => { const u = getUser(); return !!u && u.enrollments.includes(id); };

  /** Alterna la inscripción del usuario. Devuelve {ok, enrolled} o {ok:false, needAuth:true}. */
  function toggleEnrollment(id) {
    const u = getUser();
    if (!u) return { ok: false, needAuth: true };
    const i = u.enrollments.indexOf(id);
    if (i >= 0) u.enrollments.splice(i, 1);
    else u.enrollments.push(id);
    saveUser(u);
    return { ok: true, enrolled: i < 0 };
  }

  /* ─── Estado visual (navbar) ───────────────────────────────────────────── */
  function setDocAuthState() {
    document.documentElement.dataset.auth = isAuthenticated() ? "user" : "guest";
  }

  function paintUI() {
    setDocAuthState();
    const u = getUser();
    document.querySelectorAll("[data-auth-name]").forEach((el) => { el.textContent = u ? u.name : ""; });
    document.querySelectorAll("[data-auth-firstname]").forEach((el) => { el.textContent = u ? u.name.split(/\s+/)[0] : ""; });
    document.querySelectorAll("[data-auth-initials]").forEach((el) => { el.textContent = u ? initials(u.name) : "··"; });
  }

  function initLogoutButtons() {
    document.querySelectorAll("[data-auth-logout]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
        location.href = "index.html";
      });
    });
  }

  /* ─── Formularios de login / registro ─────────────────────────────────── */
  const ALLOWED_NEXT = [
    "perfil.html", "campanas.html", "index.html", "gamificacion.html", "informacion.html",
    "operativo.html", "admin-institucional.html", "auditoria.html", "admin-general.html",
  ];
  /** Respeta ?next= si es una página conocida; si no, cae al home del rol dado. */
  function nextTarget(fallback) {
    const p = new URLSearchParams(location.search).get("next");
    if (ALLOWED_NEXT.includes(p)) return p;
    return fallback || "perfil.html";
  }
  function showFormError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
  }

  function initAuthForms() {
    // -- Inicio de sesión --
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
      const demoBtn = document.getElementById("login-demo");
      if (demoBtn) demoBtn.addEventListener("click", () => {
        const role = demoBtn.dataset.role || "donante";
        const res = loginAsDemo(role);
        if (!res.ok) return;
        location.href = nextTarget(roleHome(role));
      });
    }

    // -- Registro --
    const regForm = document.getElementById("register-form");
    if (regForm) {
      const err = document.getElementById("register-error");
      regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        err && err.classList.remove("show");
        regForm.classList.add("was-validated");
        if (!regForm.checkValidity()) return;
        const res = register({
          name:      document.getElementById("reg-name").value,
          email:     document.getElementById("reg-email").value,
          password:  document.getElementById("reg-password").value,
          bloodType: document.getElementById("reg-blood").value,
          document:  document.getElementById("reg-doc").value,
          city:      document.getElementById("reg-city").value,
        });
        if (!res.ok) { showFormError(err, res.error); return; }
        location.href = "perfil.html";
      });
    }
  }

  /* ─── Protección de páginas privadas ─────────────────────────────────────
     Cada panel declara en <body data-requires-auth="true"
     data-requires-role="operativo"> qué rol(es) puede verlo (separados por
     coma si aplica más de uno). Sin sesión, o con el rol equivocado, siempre
     redirige a login.html?next=<pagina> — nunca se pinta el panel de otro rol. */
  function guardProtectedPage() {
    if (!document.body || document.body.dataset.requiresAuth !== "true") return;
    const page = (location.pathname.split("/").pop() || "perfil.html");
    const user = getUser();
    if (!user) {
      location.replace("login.html?next=" + encodeURIComponent(page));
      return;
    }
    const requiredRole = document.body.dataset.requiresRole;
    if (requiredRole) {
      const allowed = requiredRole.split(",").map((r) => r.trim());
      if (!allowed.includes(user.role)) {
        location.replace("login.html?next=" + encodeURIComponent(page));
      }
    }
  }

  /* ─── API pública ──────────────────────────────────────────────────────── */
  window.Vitalis = window.Vitalis || {};
  window.Vitalis.auth = {
    getUser, isAuthenticated, initials,
    register, login, loginAsDemo, logout, roleHome,
    isEnrolled, toggleEnrollment, saveUser,
    DEMO, DEMOS,
  };

  guardProtectedPage();

  function onReady() { paintUI(); initLogoutButtons(); initAuthForms(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
