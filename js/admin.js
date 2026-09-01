/* =============================================================================
   Vitalis · RIBAS — ADMINISTRACIÓN GENERAL / SaaS / INVIMA (js/admin.js)
   -----------------------------------------------------------------------------
   Superusuario. Secciones:
     1. Estructura institucional y roles (OA-11/12/13, LI-11)
     2. Predicción y análisis histórico (OA-25/26, LI-10)
     3. Auditoría e inspección regulatoria (OA-27/28)
   Consume window.Vitalis.api y window.Vitalis.auth.
   ============================================================================= */

(function () {
  "use strict";
  if (!document.getElementById("admin-page")) return;

  const api  = window.Vitalis && window.Vitalis.api;
  const auth = window.Vitalis && window.Vitalis.auth;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (v) => String(v).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const icons = () => window.lucide && window.lucide.createIcons();
  const toast = (msg) => {
    const t = $("#admin-toast"); if (!t) return alert(msg);
    t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2600);
  };

  const ROLES = ["Coordinador de banco", "Analista de inventario", "Responsable de tamizaje", "Coordinador de despachos", "Inspector regulatorio", "Sin asignar"];

  function roleBanner() {
    const guard = window.Vitalis && window.Vitalis.guard;
    if (guard && guard.DEV_MODE) return;                       // modo dev: acceso libre
    if (guard && guard.roleCovers && guard.roleCovers("admin")) return;
    if (auth && auth.getRole() === "admin") return;
    const b = $("#admin-role-banner"); if (b) b.hidden = false;
  }

  /* ═══════════ 1 · ESTRUCTURA INSTITUCIONAL Y ROLES ═══════════ */
  let BANKS = [];

  function renderBanks() {
    $("#banks-table").innerHTML = `
      <table class="data-table">
        <thead><tr><th>ID</th><th>Banco / servicio</th><th>Ciudad</th><th>Categoría</th><th>Estado</th></tr></thead>
        <tbody>
          ${(BANKS || []).map((b) => `
            <tr>
              <td class="td-strong"><code>${esc(b.id)}</code></td>
              <td>${esc(b.nombre)}</td>
              <td>${esc(b.ciudad)}</td>
              <td>${esc(b.categoria)}</td>
              <td><span class="status ${b.estado === "activo" ? "status-ok" : "status-warn"}">${esc(b.estado)}</span></td>
            </tr>`).join("")}
        </tbody>
      </table>`;
  }

  function renderUsers(users) {
    const rows = Array.isArray(users) ? users : [];
    $("#users-table").innerHTML = `
        <table class="data-table">
          <thead><tr><th>Usuario</th><th>Correo</th><th>Banco</th><th>Rol asignado</th><th>Estado</th></tr></thead>
          <tbody>
            ${rows.map((u) => `
              <tr>
                <td class="td-strong">${esc(u.nombre)}</td>
                <td><code>${esc(u.correo)}</code></td>
                <td>${esc(u.banco)}</td>
                <td>
                  <select class="form-select form-select-sm role-select" data-user="${esc(u.id)}">
                    ${ROLES.map((r) => `<option ${r === u.rol ? "selected" : ""}>${r}</option>`).join("")}
                  </select>
                </td>
                <td><span class="status ${u.estado === "activo" ? "status-ok" : "status-critical"}">${esc(u.estado)}</span></td>
              </tr>`).join("")}
          </tbody>
        </table>`;
    $$(".role-select").forEach((sel) => sel.addEventListener("change", () => {
      toast(`Rol de ${sel.dataset.user} actualizado a "${sel.value}"`);
    }));
  }

  function loadStructure() {
    BANKS = api.MOCKS.banks(); renderBanks();                  // pintado inmediato
    renderUsers(api.MOCKS.users());
    api.AnalyticsService.banks()
      .then((res) => { if (res && res.data && res.data.length) { BANKS = res.data; renderBanks(); } })
      .catch((e) => console.error("[admin] banks:", e));
    api.AnalyticsService.users()
      .then((res) => { if (res && res.data && res.data.length) renderUsers(res.data); })
      .catch((e) => console.error("[admin] users:", e));
  }

  function initBankForm() {
    $("#bank-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      f.classList.add("was-validated");
      if (!f.checkValidity()) return;
      BANKS.push({
        id: "BS-" + String(BANKS.length + 1).padStart(2, "0"),
        nombre: $("#bank-nombre").value, ciudad: $("#bank-ciudad").value,
        categoria: $("#bank-categoria").value, estado: "en revisión",
      });
      renderBanks();
      f.reset(); f.classList.remove("was-validated");
      toast("Banco participante agregado (queda en revisión)");
    });
  }

  /* ═══════════ 2 · PREDICCIÓN Y ANÁLISIS ═══════════ */
  function barChart(rows) {
    const W = 680, H = 260, pad = 34, gap = 18;
    const max = Math.max(...rows.flatMap((r) => [r.disponibilidad, r.demanda]), 10);
    const bw = (W - pad * 2 - gap * (rows.length - 1)) / rows.length / 2;
    const y = (v) => H - pad - (v / max) * (H - pad * 2);
    const ROSE = "#f43f5e", GREY = "#cbd5e1";
    let bars = "";
    rows.forEach((r, i) => {
      const x = pad + i * ((bw * 2) + gap);
      bars += `<rect x="${x}" y="${y(r.disponibilidad)}" width="${bw}" height="${H - pad - y(r.disponibilidad)}" rx="3" fill="${ROSE}"></rect>`;
      bars += `<rect x="${x + bw + 3}" y="${y(r.demanda)}" width="${bw}" height="${H - pad - y(r.demanda)}" rx="3" fill="${GREY}"></rect>`;
      bars += `<text x="${x + bw}" y="${H - pad + 14}" text-anchor="middle" font-size="10" fill="#94a3b8">${r.tipo}</text>`;
    });
    return `
      <svg viewBox="0 0 ${W} ${H}" class="chart-svg" role="img" aria-label="Disponibilidad frente a demanda por tipo de sangre">
        <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="#e2e8f0"></line>
        ${bars}
      </svg>
      <div class="chart-legend">
        <span><i style="background:${ROSE}"></i> Disponibilidad</span>
        <span><i style="background:${GREY}"></i> Demanda proyectada</span>
      </div>`;
  }

  function renderDemand(rows) {
    const data = Array.isArray(rows) ? rows : [];
    $("#demand-chart").innerHTML = barChart(data);
    const deficit = data.filter((r) => r.demanda > r.disponibilidad);
    $("#demand-summary").textContent = deficit.length
      ? `${deficit.length} tipo(s) con demanda proyectada por encima de la disponibilidad: ${deficit.map((d) => d.tipo).join(", ")}.`
      : "La disponibilidad cubre la demanda proyectada en todos los tipos.";
  }

  function renderShortage(rows) {
    const RISK = { alto: "status-critical", medio: "status-warn", bajo: "status-ok" };
    $("#shortage-grid").innerHTML = (Array.isArray(rows) ? rows : []).map((r) => `
      <div class="shortage-card risk-${r.riesgo}">
        <div class="sc-type">${esc(r.tipo)}</div>
        <div class="sc-days">${r.diasParaEscasez}<span> días</span></div>
        <div class="sc-label">para escasez estimada</div>
        <span class="status ${RISK[r.riesgo] || "status-neutral"}">Riesgo ${esc(r.riesgo)}</span>
        <div class="sc-trend">Tendencia: ${esc(r.tendencia)}</div>
      </div>`).join("");
    icons();
  }

  function loadAnalytics() {
    renderDemand(api.MOCKS.demandVsAvailability());            // pintado inmediato
    renderShortage(api.MOCKS.shortagePrediction());
    api.AnalyticsService.demandVsAvailability()
      .then((res) => { if (res && res.data && res.data.length) renderDemand(res.data); })
      .catch((e) => console.error("[admin] demanda:", e));
    api.AnalyticsService.shortagePrediction()
      .then((res) => { if (res && res.data && res.data.length) renderShortage(res.data); })
      .catch((e) => console.error("[admin] predicción:", e));
  }

  /* ═══════════ 3 · AUDITORÍA E INSPECCIÓN ═══════════ */
  let AUDIT = [];

  function renderAudit(rows) {
    AUDIT = Array.isArray(rows) ? rows : [];
    $("#audit-table").innerHTML = `
      <table class="data-table">
        <thead><tr><th>Fecha/hora</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Resultado</th></tr></thead>
        <tbody>
          ${AUDIT.map((a) => `
            <tr>
              <td><code>${esc(a.ts)}</code></td>
              <td>${esc(a.usuario)}</td>
              <td>${esc(a.accion)}</td>
              <td>${esc(a.entidad)}</td>
              <td><span class="status ${a.resultado === "OK" ? "status-ok" : "status-info"}">${esc(a.resultado)}</span></td>
            </tr>`).join("")}
        </tbody>
      </table>`;
  }

  function loadAudit() {
    renderAudit(api.MOCKS.auditLog());                         // pintado inmediato
    api.AnalyticsService.auditLog()
      .then((res) => { if (res && res.data && res.data.length) renderAudit(res.data); })
      .catch((e) => console.error("[admin] auditoría:", e));
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function initExport() {
    $("#export-json").addEventListener("click", () => {
      const desde = $("#export-desde").value, hasta = $("#export-hasta").value;
      api.AnalyticsService.exportTraceability({ desde, hasta }).then((res) => {
        download(`informe-trazabilidad-RIBAS-${Date.now()}.json`, JSON.stringify((res && res.data) || {}, null, 2), "application/json");
        toast("Informe de trazabilidad (JSON) generado");
      }).catch((e) => console.error("[admin] export:", e));
    });
    $("#export-csv").addEventListener("click", () => {
      const head = "fecha_hora,usuario,accion,entidad,resultado\n";
      const body = AUDIT.map((a) => [a.ts, a.usuario, a.accion, a.entidad, a.resultado].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      download(`audit-log-RIBAS-${Date.now()}.csv`, head + body, "text/csv");
      toast("Registro de auditoría (CSV) exportado");
    });
  }

  /* ─── Arranque ──────────────────────────────────────────────────────────── */
  const safe = (label, fn) => { try { fn(); } catch (e) { console.error("[admin] " + label + ":", e); } };

  function init() {
    if (!api) { console.warn("[admin] Vitalis.api no disponible"); return; }
    safe("roleBanner", roleBanner);
    safe("loadStructure", loadStructure);
    safe("initBankForm", initBankForm);
    safe("loadAnalytics", loadAnalytics);
    safe("loadAudit", loadAudit);
    safe("initExport", initExport);
    icons();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
