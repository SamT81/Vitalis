/* =============================================================================
   Vitalis · RIBAS — GUARDIÁN DE SESIÓN (js/auth-guard.js)
   -----------------------------------------------------------------------------
   Se carga como PRIMER script en el <head> de todas las páginas (antes del
   render) para fijar el estado de sesión sin parpadeo.

   MODO DESARROLLO (DEV_MODE = true):
     · NUNCA redirige a login.html — se puede navegar libremente por todas las
       páginas, incluidas panel-institucional.html y admin-dashboard.html.
     · Si no hay una sesión válida, crea y activa automáticamente un usuario
       mock con rol SUPER_ADMIN en localStorage.

   MODO PRODUCCIÓN (DEV_MODE = false):
     · Restaura el guardián real: sin sesión, las páginas protegidas redirigen
       a login.html?next=<pagina>.
   ============================================================================= */

(function () {
  "use strict";

  /* Cambia a false para activar el guardián real (redirección a login). */
  var DEV_MODE = true;

  var USERS_KEY   = "vitalis_users";
  var SESSION_KEY = "vitalis_session";
  var PROTECTED   = ["perfil.html", "panel-institucional.html", "admin-dashboard.html"];

  function read(k, fb) {
    try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; }
    catch (e) { return fb; }
  }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* Usuario mock de desarrollo con acceso total. */
  var DEV_USER = {
    id: "U-DEV-SUPERADMIN",
    name: "Dev SuperAdmin",
    email: "dev@vitalis.local",
    password: "dev",
    role: "SUPER_ADMIN",
    institution: "RIBAS · Central",
    bloodType: "O+", document: "0000000000", city: "Bogotá",
    phone: "", address: "", birthdate: "",
    donations: 6, points: 900, streak: 2,
    enrollments: [], enrollmentSlots: {}, history: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    dev: true
  };

  function currentUser() {
    var s = read(SESSION_KEY, null);
    if (!s || !s.userId) return null;
    var users = read(USERS_KEY, []);
    for (var i = 0; i < users.length; i++) if (users[i].id === s.userId) return users[i];
    return null;
  }

  function ensureDevSession() {
    var users = read(USERS_KEY, []);
    var found = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === DEV_USER.id) { users[i] = DEV_USER; found = true; break; }
    }
    if (!found) users.push(DEV_USER);
    write(USERS_KEY, users);
    write(SESSION_KEY, { userId: DEV_USER.id, remember: true });
    return DEV_USER;
  }

  var user = currentUser();
  if (!user && DEV_MODE) user = ensureDevSession();

  var role = user ? (user.role || "donante") : null;

  var el = document.documentElement;
  el.setAttribute("data-auth", user ? "user" : "guest");
  el.setAttribute("data-role", role || "");
  el.setAttribute("data-dev-mode", DEV_MODE ? "on" : "off");

  /* Guardián real: sólo cuando DEV_MODE = false. */
  if (!DEV_MODE && !user) {
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (PROTECTED.indexOf(page) !== -1) {
      location.replace("login.html?next=" + encodeURIComponent(page));
    }
  }

  /* Jerarquía de roles: SUPER_ADMIN cubre todo; admin cubre institución. */
  function roleCovers(needed) {
    var r = (currentUser() || {}).role || (DEV_MODE ? "SUPER_ADMIN" : null);
    if (!r) return false;
    if (r === "SUPER_ADMIN") return true;
    if (r === "admin") return needed === "admin" || needed === "institucion";
    return r === needed;
  }

  window.Vitalis = window.Vitalis || {};
  window.Vitalis.guard = {
    DEV_MODE: DEV_MODE,
    getUser: currentUser,
    roleCovers: roleCovers
  };
})();
