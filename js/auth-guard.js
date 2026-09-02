/* =============================================================================
   Vitalis · RIBAS — GUARDIÁN DE SESIÓN (js/auth-guard.js)
   -----------------------------------------------------------------------------
   Se carga como PRIMER script en el <head> de todas las páginas (antes del
   render) para fijar el estado de sesión sin parpadeo.

   MODO DESARROLLO (DEV_MODE = true):
     · NUNCA redirige a login.html — se puede navegar libremente por todas las
       páginas, incluidos los paneles de personal (operativo, institucional,
       auditoría INVIMA y administración general).
     · Si no hay una sesión válida, crea y activa automáticamente un usuario
       mock con rol SUPER_ADMIN en localStorage.
     · Se puede apagar en caliente desde la navbar (menú del avatar → "Modo
       Dev"), que guarda la preferencia en localStorage ("vitalis_devmode").

   MODO PRODUCCIÓN (DEV_MODE = false):
     · Restaura el guardián real: sin sesión, las páginas protegidas redirigen
       a login.html?next=<pagina>. El control por rol lo completa js/auth.js
       (atributo data-requires-role del <body>).

   Roles del sistema (ver SRS), de menor a mayor alcance:
     donante · operativo · admin_institucional · auditor · admin_general
   Roles heredados (versiones previas), remapeados por js/auth.js:
     institucion → admin_institucional   ·   admin → admin_general
   El usuario mock de desarrollo usa el rol especial SUPER_ADMIN (cubre todo).
   ============================================================================= */

(function () {
  "use strict";

  var USERS_KEY    = "vitalis_users";
  var SESSION_KEY  = "vitalis_session";
  var DEVMODE_KEY  = "vitalis_devmode";           // "on" | "off" (override de la navbar)

  /* Valor por defecto del modo desarrollo. Cambia a false para publicar. */
  var DEV_MODE_DEFAULT = true;

  var PROTECTED = [
    "perfil.html",
    "panel-institucional.html", "admin-dashboard.html",
    "operativo.html", "admin-institucional.html", "auditoria.html", "admin-general.html"
  ];

  /* Etiquetas legibles de cada rol (reutilizadas por la navbar). */
  var ROLE_LABEL = {
    donante:             "Donante",
    operativo:           "Personal Operativo",
    admin_institucional: "Admin. Institucional",
    auditor:             "Auditor INVIMA",
    admin_general:       "Admin. General",
    SUPER_ADMIN:         "Dev · SuperAdmin",
    institucion:         "Admin. Institucional",
    admin:               "Admin. General"
  };

  function read(k, fb) {
    try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; }
    catch (e) { return fb; }
  }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* DEV_MODE efectivo: valor por defecto salvo override explícito en localStorage
     (se guarda como texto plano "on" / "off" desde la navbar). */
  function resolveDevMode() {
    try {
      var o = (localStorage.getItem(DEVMODE_KEY) || "").replace(/"/g, "");
      if (o === "on") return true;
      if (o === "off") return false;
    } catch (e) {}
    return DEV_MODE_DEFAULT;
  }
  var DEV_MODE = resolveDevMode();

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

  /* Guardián real de "sin sesión": sólo cuando DEV_MODE = false.
     El guardián por ROL (redirección cuando el rol no coincide con
     data-requires-role) lo aplica js/auth.js al cargar el DOM. */
  if (!DEV_MODE && !user) {
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (PROTECTED.indexOf(page) !== -1) {
      location.replace("login.html?next=" + encodeURIComponent(page));
    }
  }

  /* ─── Jerarquía de roles ─────────────────────────────────────────────────
     roleCovers(needed) responde: ¿el rol de la sesión actual da acceso a lo
     que pide `needed`? Acepta tanto los tokens nuevos como los heredados. */
  var COVERAGE = {
    SUPER_ADMIN:         ["donante", "operativo", "admin_institucional", "auditor", "admin_general",
                          "institucion", "admin", "SUPER_ADMIN"],
    admin_general:       ["donante", "operativo", "admin_institucional", "auditor", "admin_general",
                          "institucion", "admin"],
    admin:               ["donante", "operativo", "admin_institucional", "auditor", "admin_general",
                          "institucion", "admin"],
    admin_institucional: ["operativo", "admin_institucional", "institucion"],
    institucion:         ["operativo", "admin_institucional", "institucion"],
    auditor:             ["auditor"],
    operativo:           ["operativo"],
    donante:             ["donante"]
  };

  function roleCovers(needed) {
    var r = (currentUser() || {}).role || (DEV_MODE ? "SUPER_ADMIN" : null);
    if (!r) return false;
    if (r === needed) return true;
    var list = COVERAGE[r];
    return !!list && list.indexOf(needed) !== -1;
  }

  /* Cambia el modo Dev en caliente (lo usa el menú del avatar en la navbar). */
  function setDevMode(on) {
    try { localStorage.setItem(DEVMODE_KEY, on ? "on" : "off"); } catch (e) {}
    location.reload();
  }

  window.Vitalis = window.Vitalis || {};
  window.Vitalis.guard = {
    DEV_MODE: DEV_MODE,
    PROTECTED: PROTECTED,
    ROLE_LABEL: ROLE_LABEL,
    getUser: currentUser,
    roleCovers: roleCovers,
    setDevMode: setDevMode
  };
})();
