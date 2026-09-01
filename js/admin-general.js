/* =============================================================================
   Vitalis · RIBAS — PANEL DE ADMINISTRADOR GENERAL DEL SISTEMA (admin-general.html)
   -----------------------------------------------------------------------------
   Administración global del SaaS multi-tenant: tenants/instituciones de la
   red, roles y permisos del sistema, y monitoreo de seguridad. Sigue el mismo
   patrón de js/operativo.js, js/admin-institucional.js y js/auditoria.js.

   Claves de almacenamiento:
     vitalis_users   → reutilizada solo para lectura (conteo de usuarios por rol)
     vitalis_tenants → array de instituciones registradas en el SaaS

   Depende de: js/auth.js (cargado antes) para la sesión → window.Vitalis.auth.
   ============================================================================= */

(function () {
  "use strict";

  const auth = (window.Vitalis && window.Vitalis.auth) || null;
  if (!auth) return;

  const USERS_KEY   = "vitalis_users";
  const TENANTS_KEY = "vitalis_tenants";

  const read  = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
  const write = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const refreshIcons = () => window.lucide && window.lucide.createIcons();
  const esc = (str) => String(str).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  function formatLong(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  }

  const TENANT_STATUS_LABEL = { activa: "Activa", mantenimiento: "En mantenimiento", suspendida: "Suspendida" };
  const TENANT_STATUS_TAG   = { activa: "tag-emerald", mantenimiento: "tag-amber", suspendida: "tag-rose" };

  const ROLE_LABEL = {
    donante: "Donante",
    operativo: "Personal Operativo",
    admin_institucional: "Admin. Institucional",
    auditor: "Auditor INVIMA",
    admin_general: "Admin. General",
  };
  const ROLE_ORDER = ["donante", "operativo", "admin_institucional", "auditor", "admin_general"];

  /* ─── 3. Roles y permisos del sistema (párrafo breve por rol) ────────────── */
  const ROLE_DEFINITIONS = [
    { role: "donante", icon: "user-round",
      desc: "Dona sangre y sigue su historial, puntos y medallas. Se autorregistra libremente desde el portal público y gestiona su perfil, sus campañas suscritas y sus certificados de donación.",
      access: "Autorregistro público" },
    { role: "operativo", icon: "clipboard-list",
      desc: "Personal de banco de sangre o centro de salud: gestiona el inventario y la trazabilidad de su sede, registra unidades, actualiza su ciclo de vida y resultado de tamizaje, y solicita intercambios interinstitucionales.",
      access: "Cuenta creada por un administrador" },
    { role: "admin_institucional", icon: "building-2",
      desc: "Administra su institución (tenant): crea cuentas de personal operativo, define capacidad y estado de la sede, valida solicitudes de intercambio B2B recibidas y configura la cobertura de campañas.",
      access: "Cuenta creada por un administrador" },
    { role: "auditor", icon: "shield-check",
      desc: "Auditor regulatorio INVIMA con acceso transversal de solo lectura entre instituciones: consulta la red completa, la trazabilidad de unidades y los informes de desecho biológico para verificar cumplimiento normativo.",
      access: "Cuenta creada por un administrador" },
    { role: "admin_general", icon: "server-cog",
      desc: "Superusuario del sistema: administra los tenants de la red, supervisa los roles y permisos de la plataforma, y monitorea la seguridad e infraestructura de todo el sistema Vitalis.",
      access: "Cuenta creada por un administrador" },
  ];

  /* ─── 2. Siembra de tenants (instituciones registradas en el SaaS) ──────── */
  function ensureTenantSeed() {
    if (read(TENANTS_KEY, null)) return;
    write(TENANTS_KEY, [
      { id: "T-001", name: "Cruz Roja Colombiana, Seccional Cundinamarca", city: "Bogotá, D.C.", type: "Cruz Roja",       status: "activa",        createdAt: "2019-03-10" },
      { id: "T-002", name: "Banco de Sangre Distrital de Bogotá",          city: "Bogotá, D.C.", type: "Banco de sangre", status: "activa",        createdAt: "2018-06-01" },
      { id: "T-003", name: "Hospital Universitario San Ignacio",           city: "Bogotá, D.C.", type: "Hospital",        status: "activa",        createdAt: "2017-11-22" },
      { id: "T-004", name: "Hemocentro Departamental del Valle",           city: "Cali, Valle del Cauca", type: "Banco de sangre", status: "mantenimiento", createdAt: "2016-02-15" },
      { id: "T-005", name: "Banco de Sangre Clínica Country",              city: "Bogotá, D.C.", type: "Clínica",         status: "suspendida",     createdAt: "2020-09-05" },
      { id: "T-006", name: "Fundación Santa Fe de Bogotá",                 city: "Bogotá, D.C.", type: "Hospital",        status: "activa",        createdAt: "2015-05-30" },
    ]);
  }

  const getTenants  = () => read(TENANTS_KEY, []);
  const saveTenants = (v) => write(TENANTS_KEY, v);

  /* ─── 4. Eventos de monitoreo / auditoría de seguridad (más reciente primero) */
  const SECURITY_EVENTS = [
    { at: "2026-08-31T09:14:00", severity: "warning",  icon: "shield-alert", message: "Login fallido — laura@ribas.co" },
    { at: "2026-08-30T18:02:00", severity: "info",      icon: "building-2",   message: "Nueva institución registrada — Fundación Santa Fe de Bogotá" },
    { at: "2026-08-30T11:47:00", severity: "warning",   icon: "key-round",    message: "Cambio de permisos — rol Personal Operativo" },
    { at: "2026-08-29T22:31:00", severity: "info",      icon: "repeat",       message: "Solicitud de intercambio B2B rechazada — Hemocentro Distrital" },
    { at: "2026-08-29T08:15:00", severity: "info",      icon: "user-plus",    message: "Cuenta de personal operativo creada — mariana.suarez@ribas.co" },
    { at: "2026-08-28T20:03:00", severity: "warning",   icon: "shield-alert", message: "Login fallido — carlos@ribas.co" },
    { at: "2026-08-27T14:50:00", severity: "critical",  icon: "triangle-alert", message: "Sede en mantenimiento — Hemocentro Departamental del Valle" },
    { at: "2026-08-26T07:22:00", severity: "info",      icon: "database-backup", message: "Copia de seguridad completada" },
  ].sort((a, b) => b.at.localeCompare(a.at));

  const EVENT_ICO_CLASS = { info: "ev-info", warning: "ev-warning", critical: "ev-critical" };
  const EVENT_TAG        = { info: "tag-sky", warning: "tag-amber", critical: "tag-rose" };
  const EVENT_LABEL      = { info: "Info", warning: "Advertencia", critical: "Crítico" };

  function formatDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  /* ==========================================================================
     1. Resumen del sistema
     ========================================================================== */

  function renderSummary() {
    const tenants = getTenants();
    const activeTenants = tenants.filter((t) => t.status === "activa").length;
    const infraAlerts = tenants.filter((t) => t.status !== "activa").length;
    const users = read(USERS_KEY, []);

    const wrap = $("#ag-summary");
    if (wrap) {
      wrap.innerHTML = [
        { icon: "building-2",     cls: "st-rose",  label: "Tenants activos en el SaaS",         value: String(activeTenants) },
        { icon: "server-crash",   cls: "st-amber", label: "Alertas de infraestructura abiertas", value: String(infraAlerts) },
        { icon: "users",          cls: "st-sky",   label: "Usuarios totales de la plataforma",   value: String(users.length) },
      ].map((t) => `
        <div class="col-6 col-lg-4">
          <div class="stat-tile ${t.cls}">
            <i data-lucide="${t.icon}"></i>
            <div><div class="st-label">${esc(t.label)}</div><div class="st-value">${esc(t.value)}</div></div>
          </div>
        </div>`).join("");
    }

    const roleWrap = $("#ag-role-counts");
    if (roleWrap) {
      roleWrap.innerHTML = ROLE_ORDER.map((role) => {
        const count = users.filter((u) => (u.role || "donante") === role).length;
        return `
          <div class="role-count-chip">
            <span class="rc-label">${esc(ROLE_LABEL[role])}</span>
            <span class="rc-value">${count}</span>
          </div>`;
      }).join("");
    }
  }

  /* ==========================================================================
     2. Gestión de tenants
     ========================================================================== */

  function renderTenantsTable(user) {
    const wrap = $("#ag-tenants-table");
    if (!wrap) return;
    const tenants = getTenants().slice().sort((a, b) => a.name.localeCompare(b.name));

    if (!tenants.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <i data-lucide="building-2"></i>
          <div>Aún no hay instituciones registradas en la red.</div>
        </div>`;
      return;
    }

    wrap.innerHTML = `
      <div class="pt-scroll">
        <table class="panel-table">
          <thead><tr><th>Institución</th><th>Ciudad</th><th>Tipo</th><th>Estado</th><th>Fecha de alta</th></tr></thead>
          <tbody>
            ${tenants.map((t) => `
              <tr>
                <td class="pt-primary">${esc(t.name)}</td>
                <td>${esc(t.city)}</td>
                <td>${esc(t.type)}</td>
                <td><span class="tag ${TENANT_STATUS_TAG[t.status] || "tag-slate"}">${esc(TENANT_STATUS_LABEL[t.status] || t.status)}</span></td>
                <td>${esc(formatLong(t.createdAt))}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }

  function initTenantForm() {
    const form = $("#tenant-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const err = $("#tenant-error");
      err && err.classList.remove("show");
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;

      const name = $("#tenant-name").value.trim();
      const tenants = getTenants();
      if (tenants.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
        if (err) { err.textContent = "Ya existe una institución registrada con ese nombre."; err.classList.add("show"); }
        return;
      }

      tenants.push({
        id: "T-" + Date.now().toString(36).toUpperCase(),
        name,
        city: $("#tenant-city").value.trim(),
        type: $("#tenant-type").value,
        status: "activa",
        createdAt: new Date().toISOString().slice(0, 10),
      });
      saveTenants(tenants);

      form.reset();
      form.classList.remove("was-validated");
      renderSummary();
      renderTenantsTable();

      const modalEl = $("#tenantModal");
      const modal = modalEl && window.bootstrap && bootstrap.Modal.getOrCreateInstance(modalEl);
      if (modal) modal.hide();
    });
  }

  /* ==========================================================================
     3. Roles y permisos del sistema
     ========================================================================== */

  function renderRoles() {
    const wrap = $("#ag-roles");
    if (!wrap) return;
    wrap.innerHTML = ROLE_DEFINITIONS.map((r) => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="role-card">
          <div class="rc-head">
            <span class="rc-ico"><i data-lucide="${r.icon}"></i></span>
            <span class="rc-name">${esc(ROLE_LABEL[r.role])}</span>
          </div>
          <p>${esc(r.desc)}</p>
          <span class="tag ${r.role === "donante" ? "tag-emerald" : "tag-slate"}">${esc(r.access)}</span>
        </div>
      </div>`).join("");
  }

  /* ==========================================================================
     4. Monitoreo / auditoría de seguridad
     ========================================================================== */

  function renderEvents() {
    const wrap = $("#ag-events");
    if (!wrap) return;
    $("#ag-events-count").textContent = `${SECURITY_EVENTS.length} eventos`;

    wrap.innerHTML = SECURITY_EVENTS.map((ev) => `
      <div class="event-row">
        <span class="ev-ico ${EVENT_ICO_CLASS[ev.severity] || "ev-info"}"><i data-lucide="${esc(ev.icon)}"></i></span>
        <div class="min-w-0">
          <div class="ev-msg">${esc(ev.message)}</div>
          <div class="ev-meta">${esc(formatDateTime(ev.at))}</div>
        </div>
        <span class="tag ${EVENT_TAG[ev.severity] || "tag-slate"} ev-right">${esc(EVENT_LABEL[ev.severity] || ev.severity)}</span>
      </div>`).join("");
  }

  /* ==========================================================================
     Cabecera de sesión
     ========================================================================== */

  function paintHeader(user) {
    const sub = $(".ag-user-sub");
    if (sub) sub.textContent = user.institution || "Superusuario del sistema";
  }

  /* ==========================================================================
     Arranque
     ========================================================================== */

  function init() {
    const user = auth.getUser();
    if (!user || user.role !== "admin_general") return; // el guardián de auth.js ya redirige

    ensureTenantSeed();

    paintHeader(user);
    initTenantForm();

    renderSummary();
    renderTenantsTable(user);
    renderRoles();
    renderEvents();

    refreshIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
