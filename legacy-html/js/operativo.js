/* =============================================================================
   Vitalis · RIBAS — PANEL DE PERSONAL OPERATIVO (operativo.html)
   -----------------------------------------------------------------------------
   Cubre el Módulo de Gestión de Inventario y Trazabilidad Sanguínea del SRS:
   inventario por tipo de sangre, ciclo de vida de la unidad (con resultado de
   tamizaje), solicitudes de intercambio interinstitucional y campañas de la
   sede. Todo simulado con localStorage, sin backend real, siguiendo el mismo
   patrón de js/auth.js y js/main.js.

   Claves de almacenamiento nuevas:
     vitalis_inventory  → array de unidades sanguíneas de la red
     vitalis_exchanges  → array de solicitudes de intercambio interinstitucional

   Depende de: js/auth.js (cargado antes) para la sesión → window.Vitalis.auth.
   ============================================================================= */

(function () {
  "use strict";

  const auth = (window.Vitalis && window.Vitalis.auth) || null;
  if (!auth) return;

  const INVENTORY_KEY = "vitalis_inventory";
  const EXCHANGES_KEY = "vitalis_exchanges";

  const read  = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
  const write = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const refreshIcons = () => window.lucide && window.lucide.createIcons();
  const esc = (str) => String(str).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  const BLOOD_TYPES = ["O+", "O−", "A+", "A−", "B+", "B−", "AB+", "AB−"];
  const HOME_INSTITUTION = "Cruz Roja Colombiana, Seccional Cundinamarca";

  const UNIT_STATUS_LABEL = { disponible: "Disponible", cuarentena: "En cuarentena", reservada: "Reservada", descartada: "Descartada" };
  const UNIT_STATUS_TAG   = { disponible: "tag-emerald", cuarentena: "tag-amber", reservada: "tag-sky", descartada: "tag-slate" };

  const SCREENING_LABEL = { pendiente: "Pendiente", apto: "Apto", no_apto: "No apto" };
  const SCREENING_TAG   = { pendiente: "tag-amber", apto: "tag-emerald", no_apto: "tag-rose" };

  const EXCHANGE_STATUS_LABEL = { pendiente: "Pendiente", aceptada: "Aceptada", rechazada: "Rechazada" };
  const EXCHANGE_STATUS_TAG   = { pendiente: "tag-amber", aceptada: "tag-emerald", rechazada: "tag-rose" };

  const CAMPAIGN_STATUS_LABEL = { activa: "Activa", proxima: "Próxima" };
  const CAMPAIGN_STATUS_TAG   = { activa: "tag-emerald", proxima: "tag-sky" };

  function formatLong(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  }

  /* ─── Campañas de la sede (datos propios: main.js no expone las suyas) ──── */
  const OPS_CAMPAIGNS = [
    { id: "C-003", name: "Jornada Cruz Roja Cundinamarca", location: HOME_INSTITUTION,
      date: "2026-09-08", time: "7:30 a.m. – 1:00 p.m.", status: "activa", goal: 60, current: 53 },
    { id: "C-010", name: "Jornada Interna de Personal de Salud", location: HOME_INSTITUTION,
      date: "2026-09-29", time: "8:00 a.m. – 12:00 p.m.", status: "proxima", goal: 40, current: 5 },
    { id: "C-011", name: "Jornada Barrio Restrepo", location: HOME_INSTITUTION,
      date: "2026-10-13", time: "9:00 a.m. – 3:00 p.m.", status: "proxima", goal: 55, current: 0 },
  ];

  /* ─── Siembra de inventario (≈14 unidades de ejemplo) ────────────────────── */
  function ensureInventorySeed() {
    if (read(INVENTORY_KEY, null)) return;
    write(INVENTORY_KEY, [
      { id: "RB-1001", bloodType: "O+",  component: "Glóbulos rojos", date: "2026-07-25", expiry: "2026-09-02", donor: "1032456789 · Ana García Solano",     status: "disponible", screening: "apto",      institution: HOME_INSTITUTION },
      { id: "RB-1002", bloodType: "O−",  component: "Sangre total",   date: "2026-08-20", expiry: "2026-09-24", donor: "1045667788 · Julián Restrepo Vega",  status: "disponible", screening: "apto",      institution: HOME_INSTITUTION },
      { id: "RB-1003", bloodType: "A+",  component: "Plasma",         date: "2026-08-05", expiry: "2027-02-05", donor: "1098234567 · Camila Torres Duque",   status: "disponible", screening: "apto",      institution: HOME_INSTITUTION },
      { id: "RB-1004", bloodType: "A−",  component: "Plaquetas",      date: "2026-08-27", expiry: "2026-09-01", donor: "1067234511 · Diego Salazar Puentes", status: "disponible", screening: "apto",      institution: HOME_INSTITUTION },
      { id: "RB-1005", bloodType: "B+",  component: "Glóbulos rojos", date: "2026-08-29", expiry: "2026-09-05", donor: "1023456712 · Valentina Cruz Mora",   status: "disponible", screening: "pendiente", institution: HOME_INSTITUTION },
      { id: "RB-1006", bloodType: "B−",  component: "Sangre total",   date: "2026-08-10", expiry: "2026-09-14", donor: "1078234499 · Andrés Peña Ríos",      status: "cuarentena", screening: "pendiente", institution: HOME_INSTITUTION },
      { id: "RB-1007", bloodType: "AB+", component: "Plasma",         date: "2026-06-01", expiry: "2026-12-01", donor: "1011234588 · Sofía Herrera Núñez",   status: "disponible", screening: "apto",      institution: HOME_INSTITUTION },
      { id: "RB-1008", bloodType: "AB−", component: "Glóbulos rojos", date: "2026-08-15", expiry: "2026-09-22", donor: "1034567823 · Mateo Londoño Cifuentes", status: "reservada", screening: "apto",      institution: HOME_INSTITUTION },
      { id: "RB-1009", bloodType: "O+",  component: "Plaquetas",      date: "2026-08-28", expiry: "2026-09-02", donor: "1056789012 · Isabella Moreno Prieto", status: "cuarentena", screening: "pendiente", institution: HOME_INSTITUTION },
      { id: "RB-1010", bloodType: "O−",  component: "Glóbulos rojos", date: "2026-07-10", expiry: "2026-08-17", donor: "1029876543 · Santiago Rojas Beltrán", status: "descartada", screening: "no_apto",   institution: HOME_INSTITUTION },
      { id: "RB-1011", bloodType: "A+",  component: "Sangre total",   date: "2026-08-30", expiry: "2026-10-11", donor: "1043219876 · Daniela Vargas Ocampo",  status: "disponible", screening: "apto",      institution: HOME_INSTITUTION },
      { id: "RB-1012", bloodType: "B+",  component: "Plasma",         date: "2026-08-01", expiry: "2027-02-01", donor: "1087654321 · Nicolás Gómez Aristizábal", status: "reservada", screening: "apto",   institution: HOME_INSTITUTION },
      { id: "RB-1013", bloodType: "AB+", component: "Sangre total",   date: "2026-08-22", expiry: "2026-09-03", donor: "1065432109 · Laura Jiménez Rojas",   status: "disponible", screening: "apto",      institution: HOME_INSTITUTION },
      { id: "RB-1014", bloodType: "O+",  component: "Glóbulos rojos", date: "2026-08-24", expiry: "2026-10-05", donor: "1076543210 · Tomás Escobar Ibáñez",  status: "disponible", screening: "no_apto",   institution: HOME_INSTITUTION },
    ]);
  }

  /* ─── Siembra de solicitudes de intercambio interinstitucional ──────────── */
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
    ]);
  }

  const getInventory = () => read(INVENTORY_KEY, []);
  const saveInventory = (v) => write(INVENTORY_KEY, v);
  const getExchanges  = () => read(EXCHANGES_KEY, []);
  const saveExchanges = (v) => write(EXCHANGES_KEY, v);

  function isExpiringSoon(unit) {
    if (unit.status === "descartada") return false;
    const days = Math.ceil((new Date(unit.expiry + "T00:00:00") - new Date()) / 86400000);
    return days >= 0 && days <= 7;
  }

  /* ==========================================================================
     Cabecera de sesión (institución del usuario)
     ========================================================================== */

  function paintHeader(user) {
    const inst = $("#ops-institution");
    if (inst) inst.textContent = user.institution || "—";
  }

  /* ==========================================================================
     1. Resumen de inventario
     ========================================================================== */

  function renderSummary(user) {
    const mine = getInventory().filter((u) => u.institution === user.institution);

    const available = mine.filter((u) => u.status === "disponible").length;
    const quarantine = mine.filter((u) => u.status === "cuarentena").length;
    const expiringSoon = mine.filter(isExpiringSoon).length;
    const total = mine.length;

    const summary = $("#ops-summary");
    if (summary) {
      summary.innerHTML = [
        { icon: "droplets",      cls: "st-rose",   label: "Unidades disponibles",             value: String(available) },
        { icon: "flask-conical", cls: "st-amber",  label: "En cuarentena",                     value: String(quarantine) },
        { icon: "alarm-clock",   cls: "st-orange", label: "Próximos vencimientos (7 días)",    value: String(expiringSoon) },
        { icon: "package",       cls: "st-sky",    label: "Total de unidades registradas",     value: String(total) },
      ].map((t) => `
        <div class="col-6 col-lg-3">
          <div class="stat-tile ${t.cls}">
            <i data-lucide="${t.icon}"></i>
            <div><div class="st-label">${esc(t.label)}</div><div class="st-value">${esc(t.value)}</div></div>
          </div>
        </div>`).join("");
    }

    const byType = $("#ops-inventory-by-type");
    if (byType) {
      byType.innerHTML = BLOOD_TYPES.map((bt) => {
        const count = mine.filter((u) => u.bloodType === bt && u.status === "disponible").length;
        return `
          <div class="bt-inventory-chip">
            <span class="bic-type">${esc(bt)}</span>
            <span class="bic-count">${count} disp.</span>
          </div>`;
      }).join("");
    }
  }

  /* ==========================================================================
     2. Registro de nueva unidad
     ========================================================================== */

  function initUnitForm(user) {
    const select = $("#unit-blood");
    if (select && select.children.length <= 1) {
      select.insertAdjacentHTML("beforeend", BLOOD_TYPES.map((bt) => `<option value="${esc(bt)}">${esc(bt)}</option>`).join(""));
    }
    const dateInput = $("#unit-date");
    if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().slice(0, 10);

    const form = $("#unit-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;

      const inventory = getInventory();
      const nextId = "RB-" + (1000 + inventory.length + 1);
      inventory.push({
        id: nextId,
        bloodType: $("#unit-blood").value,
        component: $("#unit-component").value,
        date: $("#unit-date").value,
        expiry: addDays($("#unit-date").value, $("#unit-component").value === "Plasma" ? 180 : 42),
        donor: $("#unit-donor").value.trim(),
        status: "cuarentena",
        screening: "pendiente",
        institution: user.institution,
      });
      saveInventory(inventory);

      form.reset();
      form.classList.remove("was-validated");
      if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

      const ok = $("#unit-form-success");
      if (ok) { ok.hidden = false; setTimeout(() => { ok.hidden = true; }, 3500); }

      renderAll(user);
    });
  }

  function addDays(iso, days) {
    const d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  /* ==========================================================================
     3 + 4. Ciclo de vida de la unidad + resultado de tamizaje
     ========================================================================== */

  function renderUnitsTable(user) {
    const wrap = $("#units-table");
    if (!wrap) return;
    const mine = getInventory()
      .filter((u) => u.institution === user.institution)
      .sort((a, b) => b.date.localeCompare(a.date));

    $("#units-count").textContent = `${mine.length} ${mine.length === 1 ? "unidad" : "unidades"}`;

    if (!mine.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <i data-lucide="package-x"></i>
          <div>Aún no hay unidades registradas para tu sede.</div>
        </div>`;
      return;
    }

    wrap.innerHTML = `
      <div class="ut-scroll">
        <table class="unit-table">
          <thead>
            <tr>
              <th>ID</th><th>Tipo</th><th>Componente</th><th>Extracción</th><th>Vence</th>
              <th>Tamizaje</th><th>Estado</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${mine.map((u) => `
              <tr>
                <td class="ut-id">${esc(u.id)}</td>
                <td>${esc(u.bloodType)}</td>
                <td>${esc(u.component)}</td>
                <td>${esc(formatLong(u.date))}</td>
                <td>${esc(formatLong(u.expiry))}${isExpiringSoon(u) ? ' <i data-lucide="triangle-alert" class="text-rose" style="width:12px;height:12px;vertical-align:-1px"></i>' : ""}</td>
                <td><span class="tag ${SCREENING_TAG[u.screening] || "tag-slate"}">${esc(SCREENING_LABEL[u.screening] || u.screening)}</span></td>
                <td><span class="tag ${UNIT_STATUS_TAG[u.status] || "tag-slate"}">${esc(UNIT_STATUS_LABEL[u.status] || u.status)}</span></td>
                <td>
                  <select class="status-select" data-unit="${esc(u.id)}" aria-label="Cambiar estado de ${esc(u.id)}">
                    ${Object.keys(UNIT_STATUS_LABEL).map((s) => `<option value="${s}" ${s === u.status ? "selected" : ""}>${esc(UNIT_STATUS_LABEL[s])}</option>`).join("")}
                  </select>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;

    $$("[data-unit]", wrap).forEach((sel) => {
      sel.addEventListener("change", () => {
        const inventory = getInventory();
        const unit = inventory.find((u) => u.id === sel.dataset.unit);
        if (unit) { unit.status = sel.value; saveInventory(inventory); }
        renderAll(user);
      });
    });
  }

  /* ==========================================================================
     5. Solicitudes de intercambio interinstitucional
     ========================================================================== */

  let exchangeTab = "enviadas";

  function renderExchanges(user) {
    const wrap = $("#exchanges-table");
    if (!wrap) return;
    const all = getExchanges();
    const rows = exchangeTab === "enviadas"
      ? all.filter((e) => e.institutionFrom === user.institution)
      : all.filter((e) => e.institutionTo === user.institution);

    if (!rows.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <i data-lucide="repeat"></i>
          <div>${exchangeTab === "enviadas" ? "Aún no has enviado solicitudes de intercambio." : "No tienes solicitudes recibidas de otras instituciones."}</div>
        </div>`;
      return;
    }

    const otherCol = exchangeTab === "enviadas" ? "Institución destino" : "Institución de origen";
    wrap.innerHTML = `
      <div class="ut-scroll">
        <table class="exchange-table">
          <thead><tr><th>Fecha</th><th>${otherCol}</th><th>Tipo</th><th>Cantidad</th><th>Estado</th></tr></thead>
          <tbody>
            ${rows.slice().sort((a, b) => b.date.localeCompare(a.date)).map((e) => `
              <tr>
                <td>${esc(formatLong(e.date))}</td>
                <td class="ex-inst">${esc(exchangeTab === "enviadas" ? e.institutionTo : e.institutionFrom)}</td>
                <td>${esc(e.bloodType)}</td>
                <td>${e.quantity} u.</td>
                <td><span class="tag ${EXCHANGE_STATUS_TAG[e.status] || "tag-slate"}">${esc(EXCHANGE_STATUS_LABEL[e.status] || e.status)}</span></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }

  function initExchangeTabs(user) {
    $$("[data-exch-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        exchangeTab = btn.dataset.exchTab;
        $$("[data-exch-tab]").forEach((b) => b.classList.toggle("is-active", b === btn));
        renderExchanges(user);
      });
    });
  }

  function initExchangeForm(user) {
    const select = $("#exch-blood");
    if (select && select.children.length <= 1) {
      select.insertAdjacentHTML("beforeend", BLOOD_TYPES.map((bt) => `<option value="${esc(bt)}">${esc(bt)}</option>`).join(""));
    }

    const form = $("#exchange-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;

      const exchanges = getExchanges();
      exchanges.push({
        id: "EX-" + Date.now().toString(36).toUpperCase(),
        institutionFrom: user.institution,
        institutionTo: $("#exch-institution").value.trim(),
        bloodType: $("#exch-blood").value,
        quantity: Number($("#exch-qty").value) || 1,
        status: "pendiente",
        date: new Date().toISOString().slice(0, 10),
      });
      saveExchanges(exchanges);

      form.reset();
      form.classList.remove("was-validated");

      exchangeTab = "enviadas";
      $$("[data-exch-tab]").forEach((b) => b.classList.toggle("is-active", b.dataset.exchTab === "enviadas"));
      renderExchanges(user);

      const modalEl = $("#exchangeModal");
      const modal = modalEl && window.bootstrap && bootstrap.Modal.getOrCreateInstance(modalEl);
      if (modal) modal.hide();
    });
  }

  /* ==========================================================================
     6. Campañas de la sede
     ========================================================================== */

  function renderOpsCampaigns(user) {
    const wrap = $("#ops-campaigns");
    if (!wrap) return;
    const mine = OPS_CAMPAIGNS
      .filter((c) => c.location === user.institution)
      .sort((a, b) => a.date.localeCompare(b.date));

    $("#ops-campaigns-count").textContent = `${mine.length} ${mine.length === 1 ? "campaña" : "campañas"}`;

    if (!mine.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <i data-lucide="calendar-x"></i>
          <div>Tu sede no tiene campañas registradas todavía.</div>
        </div>`;
      return;
    }

    wrap.innerHTML = `
      <div class="ut-scroll">
        <table class="campaign-mini-table">
          <thead><tr><th>Campaña</th><th>Fecha</th><th>Estado</th><th>Meta</th></tr></thead>
          <tbody>
            ${mine.map((c) => {
              const pct = Math.min(100, Math.round((c.current / c.goal) * 100));
              return `
              <tr>
                <td class="cm-name">${esc(c.name)}</td>
                <td>${esc(formatLong(c.date))} · ${esc(c.time)}</td>
                <td><span class="tag ${CAMPAIGN_STATUS_TAG[c.status] || "tag-slate"}">${esc(CAMPAIGN_STATUS_LABEL[c.status] || c.status)}</span></td>
                <td>
                  <div class="cm-progress">
                    <div class="progress-thin"><div class="progress-bar bg-rose" style="width:${pct}%"></div></div>
                    <span class="cm-progress-pct">${c.current}/${c.goal}</span>
                  </div>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
  }

  /* ==========================================================================
     Arranque
     ========================================================================== */

  function renderAll(user) {
    renderSummary(user);
    renderUnitsTable(user);
    renderExchanges(user);
    renderOpsCampaigns(user);
    refreshIcons();
  }

  function init() {
    let user = auth.getUser();
    const g = window.Vitalis && window.Vitalis.guard;
    const canView = user && (user.role === "operativo"
      || (g && g.DEV_MODE)
      || (g && g.roleCovers && g.roleCovers("operativo")));
    if (!canView) return; // el guardián de auth.js / auth-guard.js ya redirige

    // Vista de un rol superior (o modo Dev): usa una sede demo para mostrar datos.
    if (user && user.role !== "operativo") user = Object.assign({}, user, { institution: "Cruz Roja Colombiana, Seccional Cundinamarca" });

    ensureInventorySeed();
    ensureExchangeSeed();

    paintHeader(user);
    initUnitForm(user);
    initExchangeTabs(user);
    initExchangeForm(user);

    renderAll(user);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
