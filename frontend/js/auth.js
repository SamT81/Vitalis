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

  /* ─── Cuenta de demostración (se crea la primera vez) ───────────────────── */
  const DEMO = { email: "ana@vitalis.co", password: "demo1234" };

  function ensureSeed() {
    const users = read(USERS_KEY, []);
    if (users.some((u) => u.email === DEMO.email)) return;
    users.push({
      id: "U-DEMO", name: "Ana García Solano", email: DEMO.email, password: DEMO.password,
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
    write(USERS_KEY, users);
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

  /** Persiste los cambios del usuario con sesión activa. */
  function saveUser(user) {
    const users = getUsers();
    const i = users.findIndex((u) => u.id === user.id);
    if (i >= 0) { users[i] = user; saveUsers(users); }
  }

  const isAuthenticated = () => !!getUser();
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
  const ALLOWED_NEXT = ["perfil.html", "campanas.html", "index.html", "gamificacion.html", "informacion.html"];
  function nextTarget() {
    const p = new URLSearchParams(location.search).get("next");
    return ALLOWED_NEXT.includes(p) ? p : "perfil.html";
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
        location.href = nextTarget();
      });
      const demoBtn = document.getElementById("login-demo");
      if (demoBtn) demoBtn.addEventListener("click", () => {
        login(DEMO.email, DEMO.password, true);
        location.href = nextTarget();
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

  /* ─── Protección de páginas privadas ───────────────────────────────────── */
  function guardProtectedPage() {
    if (document.body && document.body.dataset.requiresAuth === "true" && !isAuthenticated()) {
      const page = (location.pathname.split("/").pop() || "perfil.html");
      location.replace("login.html?next=" + encodeURIComponent(page));
    }
  }

  /* ─── API pública ──────────────────────────────────────────────────────── */
  window.Vitalis = window.Vitalis || {};
  window.Vitalis.auth = {
    getUser, isAuthenticated, initials,
    register, login, logout,
    isEnrolled, toggleEnrollment, saveUser,
    DEMO,
  };

  guardProtectedPage();

  function onReady() { paintUI(); initLogoutButtons(); initAuthForms(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
