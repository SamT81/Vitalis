/* =============================================================================
   Vitalis · RIBAS — PANEL DE AUDITOR REGULATORIO · INVIMA (auditoria.html)
   -----------------------------------------------------------------------------
   Acceso centralizado de SOLO LECTURA entre instituciones: red de instituciones,
   trazabilidad de unidades e informes de desecho biológico / cuarentena. No
   existe ningún control de creación, edición o eliminación en este panel — es
   intencional (regla de negocio del SRS para el rol de auditoría).

   Todos los datos son simulados en memoria (no localStorage propio): un
   auditor consulta la red, no un solo tenant, así que no hace falta una clave
   de almacenamiento nueva. Sigue el mismo patrón de js/operativo.js y
   js/admin-institucional.js.

   Depende de: js/auth.js (cargado antes) para la sesión → window.Vitalis.auth.
   ============================================================================= */

(function () {
  "use strict";

  const auth = (window.Vitalis && window.Vitalis.auth) || null;
  if (!auth) return;

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

  const INSTITUTION_STATUS_LABEL = { activa: "Activa", mantenimiento: "En mantenimiento", suspendida: "Suspendida" };
  const INSTITUTION_STATUS_TAG   = { activa: "tag-emerald", mantenimiento: "tag-amber", suspendida: "tag-rose" };

  const REASON_TAG = { "Vencida": "tag-amber", "Tamizaje no apto": "tag-rose", "Otro": "tag-slate" };

  /* ─── 2. Instituciones de la red (dato transversal, no un solo tenant) ──── */
  const INSTITUTIONS = [
    { name: "Cruz Roja Colombiana, Seccional Cundinamarca", city: "Bogotá, D.C.",
      license: "INVIMA-BS-0142-2010", capacity: 220, status: "activa" },
    { name: "Banco de Sangre Distrital de Bogotá", city: "Bogotá, D.C.",
      license: "INVIMA-BS-0087-2015", capacity: 340, status: "activa" },
    { name: "Hospital Universitario San Ignacio", city: "Bogotá, D.C.",
      license: "INVIMA-BS-0210-2012", capacity: 150, status: "activa" },
    { name: "Hemocentro Departamental del Valle", city: "Cali, Valle del Cauca",
      license: "INVIMA-BS-0056-2008", capacity: 280, status: "mantenimiento" },
    { name: "Banco de Sangre Clínica Country", city: "Bogotá, D.C.",
      license: "INVIMA-BS-0301-2019", capacity: 95, status: "suspendida" },
  ];

  /* ─── 1. Alertas de cumplimiento abiertas (número simulado) ─────────────── */
  const COMPLIANCE_ALERTS = [
    { institution: "Banco de Sangre Clínica Country", reason: "Licencia sanitaria suspendida", date: "2026-08-20" },
    { institution: "Hemocentro Departamental del Valle", reason: "Sede en mantenimiento sin fecha de reapertura", date: "2026-08-14" },
    { institution: "Hospital Universitario San Ignacio", reason: "Informe de tamizaje pendiente de entrega", date: "2026-08-28" },
  ];

  /* ─── 3. Trazabilidad: cadena de custodia simulada para 3 unidades ───────── */
  const TRACE_HISTORY = {
    "RB-1001": {
      bloodType: "O+", component: "Glóbulos rojos", institution: "Cruz Roja Colombiana, Seccional Cundinamarca",
      events: [
        { date: "2026-07-25", title: "Extracción registrada", meta: "Cruz Roja Colombiana, Seccional Cundinamarca", icon: "droplet" },
        { date: "2026-07-26", title: "Tamizaje: Apto", meta: "Laboratorio central de la sede", icon: "flask-conical" },
        { date: "2026-07-27", title: "Estado: Disponible en inventario", meta: "Cruz Roja Colombiana, Seccional Cundinamarca", icon: "package-check" },
        { date: "2026-09-02", title: "Próxima a vencimiento", meta: "Alerta automática (7 días)", icon: "alarm-clock" },
      ],
    },
    "RB-1006": {
      bloodType: "B−", component: "Sangre total", institution: "Cruz Roja Colombiana, Seccional Cundinamarca",
      events: [
        { date: "2026-08-10", title: "Extracción registrada", meta: "Cruz Roja Colombiana, Seccional Cundinamarca", icon: "droplet" },
        { date: "2026-08-11", title: "Tamizaje: Pendiente", meta: "Laboratorio central de la sede", icon: "flask-conical" },
        { date: "2026-08-11", title: "Estado: En cuarentena", meta: "A la espera de resultado de tamizaje", icon: "shield-alert" },
      ],
    },
    "RB-1010": {
      bloodType: "O−", component: "Glóbulos rojos", institution: "Cruz Roja Colombiana, Seccional Cundinamarca",
      events: [
        { date: "2026-07-10", title: "Extracción registrada", meta: "Cruz Roja Colombiana, Seccional Cundinamarca", icon: "droplet" },
        { date: "2026-07-11", title: "Tamizaje: No apto", meta: "Laboratorio central de la sede", icon: "flask-conical" },
        { date: "2026-07-11", title: "Estado: Descartada", meta: "Motivo: tamizaje no apto", icon: "package-x" },
        { date: "2026-08-17", title: "Desecho biológico confirmado", meta: "Cruz Roja Colombiana, Seccional Cundinamarca", icon: "trash-2" },
      ],
    },
  };

  /* ─── 4. Informe de desecho biológico / cuarentena por institución ──────── */
  const DISCARD_REPORTS = [
    { institution: "Cruz Roja Colombiana, Seccional Cundinamarca", unitsDiscarded: 3, reason: "Tamizaje no apto", date: "2026-08-17" },
    { institution: "Banco de Sangre Distrital de Bogotá",          unitsDiscarded: 5, reason: "Vencida",          date: "2026-08-22" },
    { institution: "Hospital Universitario San Ignacio",           unitsDiscarded: 2, reason: "Vencida",          date: "2026-08-11" },
    { institution: "Hemocentro Departamental del Valle",           unitsDiscarded: 4, reason: "Otro",             date: "2026-08-05" },
    { institution: "Banco de Sangre Clínica Country",               unitsDiscarded: 1, reason: "Tamizaje no apto", date: "2026-07-29" },
  ];

  /* ==========================================================================
     1. Resumen de la red
     ========================================================================== */

  function renderSummary() {
    const wrap = $("#au-summary");
    if (!wrap) return;
    wrap.innerHTML = [
      { icon: "building-2", cls: "st-sky",   label: "Instituciones en la red",          value: String(INSTITUTIONS.length) },
      { icon: "flag",       cls: "st-amber", label: "Alertas de cumplimiento abiertas", value: String(COMPLIANCE_ALERTS.length) },
    ].map((t) => `
      <div class="col-6 col-lg-3">
        <div class="stat-tile ${t.cls}">
          <i data-lucide="${t.icon}"></i>
          <div><div class="st-label">${esc(t.label)}</div><div class="st-value">${esc(t.value)}</div></div>
        </div>
      </div>`).join("");
  }

  /* ==========================================================================
     2. Instituciones de la red
     ========================================================================== */

  function renderInstitutions() {
    const wrap = $("#au-institutions-table");
    if (!wrap) return;
    $("#au-institutions-count").textContent = `${INSTITUTIONS.length} instituciones`;

    wrap.innerHTML = `
      <div class="pt-scroll">
        <table class="panel-table">
          <thead><tr><th>Institución</th><th>Ciudad</th><th>Registro sanitario</th><th>Capacidad</th><th>Estado</th></tr></thead>
          <tbody>
            ${INSTITUTIONS.map((i) => `
              <tr>
                <td class="pt-primary">${esc(i.name)}</td>
                <td>${esc(i.city)}</td>
                <td>${esc(i.license)}</td>
                <td>${i.capacity} u.</td>
                <td><span class="tag ${INSTITUTION_STATUS_TAG[i.status] || "tag-slate"}">${esc(INSTITUTION_STATUS_LABEL[i.status] || i.status)}</span></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }

  /* ==========================================================================
     3. Trazabilidad de unidades
     ========================================================================== */

  function renderTraceEmpty() {
    const wrap = $("#trace-result");
    if (!wrap) return;
    wrap.innerHTML = `
      <div class="empty-state">
        <i data-lucide="search"></i>
        <div>Busca un número de unidad para ver su cadena de custodia.</div>
      </div>`;
  }

  function renderTraceResult(id) {
    const wrap = $("#trace-result");
    if (!wrap) return;
    const record = TRACE_HISTORY[id];

    if (!record) {
      wrap.innerHTML = `
        <div class="empty-state">
          <i data-lucide="package-x"></i>
          <div>No se encontró trazabilidad para <b>${esc(id)}</b>.</div>
        </div>`;
      refreshIcons();
      return;
    }

    wrap.innerHTML = `
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <span class="pt-primary">${esc(id)}</span>
          <span class="text-muted-soft small"> · ${esc(record.bloodType)} · ${esc(record.component)}</span>
        </div>
        <span class="text-muted-soft small">${esc(record.institution)}</span>
      </div>
      <div class="card-soft overflow-hidden">
        <div class="trace-timeline">
          ${record.events.map((e) => `
            <div class="trace-event">
              <span class="te-dot"><i data-lucide="${esc(e.icon)}"></i></span>
              <div class="min-w-0">
                <div class="te-title">${esc(e.title)}</div>
                <div class="te-meta">${esc(formatLong(e.date))} · ${esc(e.meta)}</div>
              </div>
            </div>`).join("")}
        </div>
      </div>`;
    refreshIcons();
  }

  function initTraceSearch() {
    const form = $("#trace-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = $("#trace-input").value.trim().toUpperCase();
      if (!raw) { renderTraceEmpty(); return; }
      renderTraceResult(raw);
    });
    renderTraceEmpty();
  }

  /* ==========================================================================
     4. Informe de desecho biológico / cuarentena
     ========================================================================== */

  function renderDiscardTable() {
    const wrap = $("#au-discard-table");
    if (!wrap) return;
    wrap.innerHTML = `
      <div class="pt-scroll">
        <table class="panel-table">
          <thead><tr><th>Institución</th><th>Unidades descartadas</th><th>Motivo</th><th>Fecha</th></tr></thead>
          <tbody>
            ${DISCARD_REPORTS.map((r) => `
              <tr>
                <td class="pt-primary">${esc(r.institution)}</td>
                <td>${r.unitsDiscarded} u.</td>
                <td><span class="tag ${REASON_TAG[r.reason] || "tag-slate"}">${esc(r.reason)}</span></td>
                <td>${esc(formatLong(r.date))}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }

  /* ==========================================================================
     Arranque
     ========================================================================== */

  function init() {
    const user = auth.getUser();
    if (!user || user.role !== "auditor") return; // el guardián de auth.js ya redirige

    renderSummary();
    renderInstitutions();
    initTraceSearch();
    renderDiscardTable();

    refreshIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
