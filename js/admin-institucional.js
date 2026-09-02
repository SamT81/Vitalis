/* =============================================================================
   Vitalis · RIBAS — PANEL DE ADMINISTRADOR INSTITUCIONAL (admin-institucional.html)
   -----------------------------------------------------------------------------
   Gestión del tenant/institución del usuario: personal operativo de la sede,
   capacidad y estado, validación de solicitudes de intercambio B2B (comparte
   la clave vitalis_exchanges con js/operativo.js: lo que el personal operativo
   envía, el administrador institucional lo valida) y cobertura de campañas.
   Todo simulado con localStorage, sin backend real, siguiendo el mismo patrón
   de js/auth.js y js/operativo.js.

   Claves de almacenamiento:
     vitalis_users        → reutilizada: nuevo personal se agrega con role: "operativo"
     vitalis_exchanges    → compartida con js/operativo.js (solicitudes B2B)
     vitalis_institutions → objeto por institución: { capacity, status, coverageCity, coverageRadiusKm }

   Depende de: js/auth.js (cargado antes) para la sesión → window.Vitalis.auth.
   ============================================================================= */

(function () {
  "use strict";

  const auth = (window.Vitalis && window.Vitalis.auth) || null;
  if (!auth) return;

  const USERS_KEY        = "vitalis_users";
  const EXCHANGES_KEY    = "vitalis_exchanges";
  const INSTITUTIONS_KEY = "vitalis_institutions";

  const read  = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
  const write = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const refreshIcons = () => window.lucide && window.lucide.createIcons();
  const esc = (str) => String(str).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  const HOME_INSTITUTION = "Cruz Roja Colombiana, Seccional Cundinamarca";

  const EXCHANGE_STATUS_LABEL = { pendiente: "Pendiente", aceptada: "Aceptada", rechazada: "Rechazada" };
  const EXCHANGE_STATUS_TAG   = { pendiente: "tag-amber", aceptada: "tag-emerald", rechazada: "tag-rose" };

  function formatLong(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  }

  /* ─── Siembra de personal operativo adicional (Carlos ya existe en auth.js) */
  function ensureStaffSeed() {
    const users = read(USERS_KEY, []);
    let changed = false;
    const addIfMissing = (u) => {
      if (users.some((x) => x.email === u.email)) return;
      users.push(u);
      changed = true;
    };

    addIfMissing({
      id: "U-STAFF-002", name: "Mariana Suárez Cárdenas", email: "mariana.suarez@ribas.co", password: "demo1234",
      role: "operativo", jobTitle: "Enfermera de extracción", institution: HOME_INSTITUTION, active: true,
      bloodType: null, donations: 0, points: 0, streak: 0, enrollments: [], history: [],
      createdAt: "2024-03-01T00:00:00.000Z",
    });
    addIfMissing({
      id: "U-STAFF-003", name: "Felipe Castañeda Ruiz", email: "felipe.castaneda@ribas.co", password: "demo1234",
      role: "operativo", jobTitle: "Bacteriólogo(a) de tamizaje", institution: HOME_INSTITUTION, active: true,
      bloodType: null, donations: 0, points: 0, streak: 0, enrollments: [], history: [],
      createdAt: "2024-05-14T00:00:00.000Z",
    });
    addIfMissing({
      id: "U-STAFF-004", name: "Paula Andrea Niño", email: "paula.nino@ribas.co", password: "demo1234",
      role: "operativo", jobTitle: "Técnica de laboratorio", institution: HOME_INSTITUTION, active: false,
      bloodType: null, donations: 0, points: 0, streak: 0, enrollments: [], history: [],
      createdAt: "2024-07-22T00:00:00.000Z",
    });
    addIfMissing({
      id: "U-STAFF-005", name: "Jorge Iván Salcedo", email: "jorge.salcedo@ribas.co", password: "demo1234",
      role: "operativo", jobTitle: "Coordinador de jornadas", institution: HOME_INSTITUTION, active: true,
      bloodType: null, donations: 0, points: 0, streak: 0, enrollments: [], history: [],
      createdAt: "2024-09-10T00:00:00.000Z",
    });

    if (changed) write(USERS_KEY, users);
  }

  /* ─── Siembra de solicitudes de intercambio (misma clave que operativo.js) */
  function ensureExchangeSeed() {
    if (read(EXCHANGES_KEY, null)) return;
    write(EXCHANGES_KEY, [
      { id: "EX-2026-001", institutionFrom: HOME_INSTITUTION, institutionTo: "Banco de Sangre Distrital de Bogotá",
        bloodType: "O−", quantity: 6, status: "pendiente", date: "2026-08-25" },
      { id: "EX-2026-002", institutionFrom: HOME_INSTITUTION, institutionTo: "Hospital Universitario San Ignacio",
        bloodType: "AB+", quantity: 3, status: "aceptada", date: "2026-08-18" },
      { id: "EX-2026-003", institutionFrom: "Fundación Santa Fe de Bogotá", institutionTo: HOME_INSTITUTION,
        bloodType: "A+", quantity: 4, status: "pendiente", date: "2026-08-27" },
      { id: "EX-2026-004", institutionFrom: "Hemocentro Distrital", institutionTo: HOME_INSTITUTION,
        bloodType: "O+", quantity: 8, status: "rechazada", date: "2026-08-12" },
      { id: "EX-2026-005", institutionFrom: "Jornada Universidad Javeriana", institutionTo: HOME_INSTITUTION,
        bloodType: "B−", quantity: 2, status: "aceptada", date: "2026-08-09" },
      { id: "EX-2026-006", institutionFrom: "Jornada Parque de la 93", institutionTo: HOME_INSTITUTION,
        bloodType: "AB−", quantity: 5, status: "pendiente", date: "2026-08-29" },
    ]);
  }

  /* ─── Siembra de configuración institucional (capacidad / estado / cobertura) */
  function ensureInstitutionSeed() {
    const all = read(INSTITUTIONS_KEY, {});
    if (all[HOME_INSTITUTION]) return;
    all[HOME_INSTITUTION] = { capacity: 220, status: "activa", coverageCity: "Bogotá, D.C.", coverageRadiusKm: 15 };
    write(INSTITUTIONS_KEY, all);
  }

  const getUsers  = () => read(USERS_KEY, []);
  const saveUsers = (v) => write(USERS_KEY, v);
  const getExchanges  = () => read(EXCHANGES_KEY, []);
  const saveExchanges = (v) => write(EXCHANGES_KEY, v);
  const getInstitutionSettings = (name) => { const all = read(INSTITUTIONS_KEY, {}); return all[name] || { capacity: 0, status: "activa", coverageCity: "", coverageRadiusKm: 0 }; };
  const saveInstitutionSettings = (name, settings) => { const all = read(INSTITUTIONS_KEY, {}); all[name] = settings; write(INSTITUTIONS_KEY, all); };

  /* ==========================================================================
     Cabecera de sesión (institución del usuario)
     ========================================================================== */

  function paintHeader(user) {
    const inst = $("#ai-institution");
    if (inst) inst.textContent = user.institution || "—";
  }

  /* ==========================================================================
     1. Resumen de la sede
     ========================================================================== */

  function renderSummary(user) {
    const staffActive = getUsers().filter((u) => u.role === "operativo" && u.institution === user.institution && u.active !== false).length;
    const settings = getInstitutionSettings(user.institution);
    const pendingB2B = getExchanges().filter((e) => e.institutionTo === user.institution && e.status === "pendiente").length;

    const wrap = $("#ai-summary");
    if (!wrap) return;
    wrap.innerHTML = [
      { icon: "users",      cls: "st-rose",  label: "Personal operativo activo",       value: String(staffActive) },
      { icon: "warehouse",  cls: "st-sky",   label: "Capacidad actual de la sede",     value: `${settings.capacity} u.` },
      { icon: "inbox",      cls: "st-amber", label: "Solicitudes B2B pendientes",      value: String(pendingB2B) },
    ].map((t) => `
      <div class="col-6 col-lg-4">
        <div class="stat-tile ${t.cls}">
          <i data-lucide="${t.icon}"></i>
          <div><div class="st-label">${esc(t.label)}</div><div class="st-value">${esc(t.value)}</div></div>
        </div>
      </div>`).join("");
  }

  /* ==========================================================================
     2. Gestión de cuentas de personal operativo
     ========================================================================== */

  function renderStaffTable(user) {
    const wrap = $("#ai-staff-table");
    if (!wrap) return;
    const mine = getUsers()
      .filter((u) => u.role === "operativo" && u.institution === user.institution)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (!mine.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <i data-lucide="users"></i>
          <div>Tu sede aún no tiene personal operativo registrado.</div>
        </div>`;
      return;
    }

    wrap.innerHTML = `
      <div class="pt-scroll">
        <table class="panel-table">
          <thead><tr><th>Nombre</th><th>Correo</th><th>Cargo</th><th>Estado</th><th>Acción</th></tr></thead>
          <tbody>
            ${mine.map((u) => {
              const active = u.active !== false;
              return `
              <tr>
                <td class="pt-primary">${esc(u.name)}</td>
                <td>${esc(u.email)}</td>
                <td>${esc(u.jobTitle || "Personal operativo")}</td>
                <td><span class="tag ${active ? "tag-emerald" : "tag-slate"}">${active ? "Activo" : "Inactivo"}</span></td>
                <td><button class="btn-toggle-status" data-staff="${esc(u.id)}" type="button">${active ? "Desactivar" : "Activar"}</button></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;

    $$("[data-staff]", wrap).forEach((btn) => {
      btn.addEventListener("click", () => {
        const users = getUsers();
        const staff = users.find((u) => u.id === btn.dataset.staff);
        if (staff) { staff.active = staff.active === false ? true : false; saveUsers(users); }
        renderAll(user);
      });
    });
  }

  function initStaffForm(user) {
    const form = $("#staff-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const err = $("#staff-error");
      err && err.classList.remove("show");
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;

      const email = $("#staff-email").value.trim();
      const users = getUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        if (err) { err.textContent = "Ya existe una cuenta registrada con ese correo."; err.classList.add("show"); }
        return;
      }

      users.push({
        id: "U-STAFF-" + Date.now().toString(36).toUpperCase(),
        name: $("#staff-name").value.trim(),
        email,
        password: "demo1234",
        role: "operativo",
        jobTitle: $("#staff-role").value,
        institution: user.institution,
        active: true,
        bloodType: null, donations: 0, points: 0, streak: 0, enrollments: [], history: [],
        createdAt: new Date().toISOString(),
      });
      saveUsers(users);

      form.reset();
      form.classList.remove("was-validated");
      renderAll(user);

      const modalEl = $("#staffModal");
      const modal = modalEl && window.bootstrap && bootstrap.Modal.getOrCreateInstance(modalEl);
      if (modal) modal.hide();
    });
  }

  /* ==========================================================================
     3. Capacidad y estado de la institución
     ========================================================================== */

  function initCapacityForm(user) {
    const settings = getInstitutionSettings(user.institution);
    const capInput = $("#cap-capacity");
    const statusSelect = $("#cap-status");
    if (capInput) capInput.value = settings.capacity;
    if (statusSelect) statusSelect.value = settings.status;

    const form = $("#capacity-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;

      const current = getInstitutionSettings(user.institution);
      saveInstitutionSettings(user.institution, {
        ...current,
        capacity: Number(capInput.value) || 0,
        status: statusSelect.value,
      });

      renderSummary(user);
      const ok = $("#capacity-success");
      if (ok) { ok.hidden = false; setTimeout(() => { ok.hidden = true; }, 3500); }
    });
  }

  /* ==========================================================================
     4. Validación de solicitudes de intercambio B2B
     ========================================================================== */

  function renderB2BTable(user) {
    const wrap = $("#ai-b2b-table");
    if (!wrap) return;
    const rows = getExchanges()
      .filter((e) => e.institutionTo === user.institution)
      .sort((a, b) => b.date.localeCompare(a.date));

    $("#ai-b2b-count").textContent = `${rows.length} ${rows.length === 1 ? "solicitud" : "solicitudes"}`;

    if (!rows.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <i data-lucide="inbox"></i>
          <div>Tu sede no tiene solicitudes de intercambio recibidas.</div>
        </div>`;
      return;
    }

    wrap.innerHTML = `
      <div class="pt-scroll">
        <table class="panel-table">
          <thead><tr><th>Fecha</th><th>Institución origen</th><th>Tipo</th><th>Cantidad</th><th>Estado</th><th>Acción</th></tr></thead>
          <tbody>
            ${rows.map((e) => `
              <tr>
                <td>${esc(formatLong(e.date))}</td>
                <td class="pt-primary">${esc(e.institutionFrom)}</td>
                <td>${esc(e.bloodType)}</td>
                <td>${e.quantity} u.</td>
                <td><span class="tag ${EXCHANGE_STATUS_TAG[e.status] || "tag-slate"}">${esc(EXCHANGE_STATUS_LABEL[e.status] || e.status)}</span></td>
                <td>
                  ${e.status === "pendiente" ? `
                    <div class="b2b-actions">
                      <button class="btn-decision is-accept" data-decide="${esc(e.id)}" data-value="aceptada" type="button"><i data-lucide="check"></i> Aceptar</button>
                      <button class="btn-decision is-reject" data-decide="${esc(e.id)}" data-value="rechazada" type="button"><i data-lucide="x"></i> Rechazar</button>
                    </div>` : `<span class="text-muted-soft small">—</span>`}
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;

    $$("[data-decide]", wrap).forEach((btn) => {
      btn.addEventListener("click", () => {
        const exchanges = getExchanges();
        const ex = exchanges.find((e) => e.id === btn.dataset.decide);
        if (ex) { ex.status = btn.dataset.value; saveExchanges(exchanges); }
        renderAll(user);
      });
    });
  }

  /* ==========================================================================
     5. Cobertura de campañas
     ========================================================================== */

  function initCoverageForm(user) {
    const settings = getInstitutionSettings(user.institution);
    const cityInput = $("#cov-city");
    const radiusInput = $("#cov-radius");
    if (cityInput) cityInput.value = settings.coverageCity || "";
    if (radiusInput) radiusInput.value = settings.coverageRadiusKm || "";

    const form = $("#coverage-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;

      const current = getInstitutionSettings(user.institution);
      saveInstitutionSettings(user.institution, {
        ...current,
        coverageCity: cityInput.value.trim(),
        coverageRadiusKm: Number(radiusInput.value) || 0,
      });

      const ok = $("#coverage-success");
      if (ok) { ok.hidden = false; setTimeout(() => { ok.hidden = true; }, 3500); }
    });
  }

  /* ==========================================================================
     Arranque
     ========================================================================== */

  function renderAll(user) {
    renderSummary(user);
    renderStaffTable(user);
    renderB2BTable(user);
    refreshIcons();
  }

  function init() {
    let user = auth.getUser();
    const g = window.Vitalis && window.Vitalis.guard;
    const canView = user && (user.role === "admin_institucional"
      || (g && g.DEV_MODE)
      || (g && g.roleCovers && g.roleCovers("admin_institucional")));
    if (!canView) return; // el guardián de auth.js / auth-guard.js ya redirige

    // Vista de un rol superior (o modo Dev): usa una sede demo para mostrar datos.
    if (user && user.role !== "admin_institucional") user = Object.assign({}, user, { institution: "Cruz Roja Colombiana, Seccional Cundinamarca" });

    ensureStaffSeed();
    ensureExchangeSeed();
    ensureInstitutionSeed();

    paintHeader(user);
    initStaffForm(user);
    initCapacityForm(user);
    initCoverageForm(user);

    renderAll(user);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
