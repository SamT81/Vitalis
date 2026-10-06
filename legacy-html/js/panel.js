/* =============================================================================
   Vitalis · RIBAS — PANEL INSTITUCIONAL B2B (js/panel.js)
   -----------------------------------------------------------------------------
   Bancos de sangre y hospitales. Pestañas:
     1. Inventario y unidades (OA-06/08/09/10) + disposición de no aptas (OA-23)
     2. Intercambio entre bancos y cadena de frío (OA-14/15/16)
     3. Campañas y convocatorias segmentadas (OA-05/17)
   Consume window.Vitalis.api y window.Vitalis.auth.
   ============================================================================= */

(function () {
  "use strict";
  if (!document.getElementById("panel-page")) return;

  const api  = window.Vitalis && window.Vitalis.api;
  const auth = window.Vitalis && window.Vitalis.auth;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (v) => String(v).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const icons = () => window.lucide && window.lucide.createIcons();
  const toast = (msg) => {
    const t = $("#panel-toast");
    if (!t) return alert(msg);
    t.textContent = msg; t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2600);
  };
  const daysUntil = (iso) => Math.round((new Date(iso) - new Date()) / 86400000);

  /* ─── Control de rol ────────────────────────────────────────────────────── */
  function roleBanner() {
    const guard = window.Vitalis && window.Vitalis.guard;
    if (guard && guard.DEV_MODE) return;                       // modo dev: acceso libre
    if (guard && guard.roleCovers && guard.roleCovers("institucion")) return;
    const role = auth && auth.getRole();
    if (role === "institucion" || role === "admin") return;
    const b = $("#panel-role-banner");
    if (b) b.hidden = false;
  }

  /* ─── Pestañas ──────────────────────────────────────────────────────────── */
  function initTabs() {
    $$(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".tab-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
        $$(".tab-panel").forEach((p) => { p.hidden = p.dataset.tab !== btn.dataset.tab; });
      });
    });
  }

  const UNIT_ESTADO = {
    apta:     { label: "Apta",        cls: "status-ok" },
    tamizaje: { label: "En tamizaje", cls: "status-warn" },
    no_apta:  { label: "No apta",     cls: "status-critical" },
  };

  /* ═══════════════ TAB 1 · INVENTARIO Y UNIDADES ═══════════════ */
  let UNITS = [];

  function renderUnits() {
    const filter = $("#unit-estado-filter").value;
    const rows = filter === "todas" ? UNITS : UNITS.filter((u) => u.estado === filter);

    // Alertas de vencimiento (OA-10)
    const porVencer = UNITS.filter((u) => { const d = daysUntil(u.vencimiento); return d >= 0 && d <= 7; });
    const alert = $("#expiry-alert");
    if (porVencer.length) {
      alert.hidden = false;
      alert.querySelector("[data-alert-text]").textContent =
        `${porVencer.length} unidad(es) vencen en 7 días o menos: ${porVencer.map((u) => u.id).join(", ")}.`;
    } else { alert.hidden = true; }

    $("#units-table").innerHTML = `
      <table class="data-table">
        <thead><tr>
          <th>Unidad</th><th>Tipo</th><th>Componente</th><th>Extracción</th><th>Vencimiento</th><th>Estado</th><th>Banco</th>
        </tr></thead>
        <tbody>
          ${rows.map((u) => {
            const d = daysUntil(u.vencimiento);
            const venc = d < 0 ? `<span class="status status-critical">Vencida</span>`
                       : d <= 7 ? `${u.vencimiento} <span class="status status-warn">${d}d</span>`
                       : u.vencimiento;
            const e = UNIT_ESTADO[u.estado];
            return `<tr>
              <td class="td-strong"><code>${esc(u.id)}</code></td>
              <td>${esc(u.tipo)}</td>
              <td>${esc(u.componente)}</td>
              <td>${esc(u.extraccion)}</td>
              <td>${venc}</td>
              <td><span class="status ${e.cls}">${e.label}</span></td>
              <td>${esc(u.banco)}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>`;
    icons();
  }

  function applyUnits(list) {
    UNITS = Array.isArray(list) ? list : [];
    const sel = $("#disp-unit");
    const noAptas = UNITS.filter((u) => u.estado === "no_apta");
    sel.innerHTML = (noAptas.length ? noAptas : UNITS)
      .map((u) => `<option value="${esc(u.id)}">${esc(u.id)} · ${esc(u.tipo)} · ${esc(u.componente)}</option>`).join("");
    renderUnits();
  }

  function loadInventory() {
    applyUnits(api.MOCKS.units());                         // pintado inmediato
    api.InventoryService.listUnits()
      .then((res) => { if (res && res.data && res.data.length) applyUnits(res.data); })
      .catch((e) => console.error("[panel] loadInventory:", e));
  }

  function initDisposalForm() {
    const form = $("#disposal-form");
    $("#disp-fecha").value = new Date().toISOString().slice(0, 10);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;
      const body = {
        unidad: $("#disp-unit").value,
        motivo: $("#disp-motivo").value,
        fecha: $("#disp-fecha").value,
        responsable: $("#disp-responsable").value,
      };
      api.InventoryService.registerDisposal(body).then((res) => {
        const li = document.createElement("li");
        li.innerHTML = `<code>${esc(res.data.folio || "DSP")}</code> — ${esc(body.unidad)} · ${esc(body.motivo)} · ${esc(body.fecha)} · ${esc(body.responsable)}`;
        $("#disposal-log").prepend(li);
        $("#disposal-log-empty").hidden = true;
        form.reset(); form.classList.remove("was-validated");
        $("#disp-fecha").value = new Date().toISOString().slice(0, 10);
        toast("Disposición registrada · folio " + (res.data.folio || "—"));
      });
    });
  }

  /* ═══════════════ TAB 2 · INTERCAMBIO Y CADENA DE FRÍO ═══════════════ */
  const URGENCIA = { alta: "status-critical", media: "status-warn", baja: "status-neutral" };
  const REQ_ESTADO = { pendiente: "status-warn", aprobada: "status-info", despachada: "status-ok", recibida: "status-ok" };

  function renderRequests(data) {
    const rows = Array.isArray(data) ? data : [];
    $("#requests-table").innerHTML = `
      <table class="data-table">
        <thead><tr><th>Solicitud</th><th>Origen</th><th>Destino</th><th>Tipo</th><th>Uds.</th><th>Urgencia</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          ${rows.map((r) => `
            <tr>
              <td class="td-strong"><code>${esc(r.id)}</code></td>
              <td>${esc(r.origen)}</td>
              <td>${esc(r.destino)}</td>
              <td>${esc(r.tipo)}</td>
              <td>${r.unidades}</td>
              <td><span class="status ${URGENCIA[r.urgencia] || "status-neutral"}">${esc(r.urgencia)}</span></td>
              <td><span class="status ${REQ_ESTADO[r.estado] || "status-neutral"}">${esc(r.estado)}</span></td>
              <td>${r.estado === "pendiente" ? `<button class="btn-row" data-approve="${esc(r.id)}"><i data-lucide="check"></i> Aprobar</button>` : ""}</td>
            </tr>`).join("")}
        </tbody>
      </table>`;
    $$("[data-approve]").forEach((b) => b.addEventListener("click", () => {
      api.TransferService.approve(b.dataset.approve)
        .then(() => { toast("Solicitud " + b.dataset.approve + " aprobada"); loadTransfers(); })
        .catch((e) => console.error("[panel] approve:", e));
    }));
    icons();
  }

  function loadTransfers() {
    renderRequests(api.MOCKS.transferRequests());          // pintado inmediato
    api.TransferService.listRequests()
      .then((res) => { if (res && res.data && res.data.length) renderRequests(res.data); })
      .catch((e) => console.error("[panel] loadTransfers:", e));
  }

  function addTempReading(hora, temp) {
    const wrap = $("#coldchain-readings");
    const row = document.createElement("div");
    row.className = "cc-reading";
    row.innerHTML = `
      <input type="time" class="form-control form-control-sm" value="${hora || ""}" aria-label="Hora de lectura" />
      <input type="number" step="0.1" class="form-control form-control-sm" placeholder="°C" value="${temp != null ? temp : ""}" aria-label="Temperatura" />
      <button type="button" class="btn-row" data-del-reading><i data-lucide="x"></i></button>`;
    row.querySelector("[data-del-reading]").addEventListener("click", () => row.remove());
    wrap.appendChild(row);
    icons();
  }

  function initDispatchForm() {
    addTempReading("06:00", 4.2);
    addTempReading("09:00", 3.8);
    $("#add-reading").addEventListener("click", () => addTempReading());
    const form = $("#dispatch-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;
      const lecturas = $$(".cc-reading").map((r) => {
        const [h, t] = r.querySelectorAll("input");
        return { hora: h.value, tempC: parseFloat(t.value) };
      }).filter((l) => l.hora && !isNaN(l.tempC));
      const body = {
        unidades: Number($("#disp-cantidad").value),
        tipo: $("#disp-tipo").value,
        destino: $("#dispatch-destino").value,
        transportadora: $("#dispatch-transportadora").value,
        eventos: $("#dispatch-eventos").value,
        cadenaFrio: lecturas,
      };
      const fueraRango = lecturas.some((l) => l.tempC < 1 || l.tempC > 10);
      api.TransferService.dispatch(body).then((res) => {
        toast(`Transferencia despachada · guía ${res.data.guia}` + (fueraRango ? " ⚠ lecturas fuera de rango" : ""));
        form.reset(); form.classList.remove("was-validated");
        $("#coldchain-readings").innerHTML = "";
        addTempReading("06:00", 4.2);
      });
    });
  }

  /* ═══════════════ TAB 3 · CAMPAÑAS Y CONVOCATORIAS ═══════════════ */
  const BLOOD = (api && api.BLOOD_TYPES) || ["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"];
  const ZONAS = (api && api.REGIONS) || ["Nacional"];

  function initCampaignForms() {
    $("#camp-tipos").innerHTML = BLOOD.map((t) =>
      `<label class="check-chip"><input type="checkbox" value="${t}" /> ${t}</label>`).join("");
    $("#conv-tipos").innerHTML = BLOOD.map((t) =>
      `<label class="check-chip"><input type="checkbox" value="${t}" checked /> ${t}</label>`).join("");
    $("#camp-zona").innerHTML = ZONAS.map((z) => `<option>${z}</option>`).join("");
    $("#conv-zona").innerHTML = ZONAS.map((z) => `<option>${z}</option>`).join("");

    $("#campaign-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      f.classList.add("was-validated");
      if (!f.checkValidity()) return;
      const body = {
        nombre: $("#camp-nombre").value, sede: $("#camp-sede").value,
        zona: $("#camp-zona").value, fecha: $("#camp-fecha").value,
        cupos: Number($("#camp-cupos").value),
        tipos: $$("#camp-tipos input:checked").map((i) => i.value),
      };
      api.CampaignService.createCampaign(body).then((res) => {
        toast("Campaña creada · " + res.data.id);
        f.reset(); f.classList.remove("was-validated");
        $$("#camp-tipos input").forEach((i) => (i.checked = false));
      });
    });

    const conv = $("#convocatoria-form");
    const preview = $("#conv-preview");
    const updatePreview = () => {
      const tipos = $$("#conv-tipos input:checked").map((i) => i.value);
      api.CampaignService.sendConvocatoria({ tipos, zona: $("#conv-zona").value }).then((res) => {
        const n = res && res.data && res.data.destinatarios;
        preview.textContent = "Alcance estimado: " + (n != null ? n.toLocaleString("es-CO") : "—") + " donantes";
      }).catch((e) => console.error("[panel] convocatoria:", e));
    };
    conv.addEventListener("change", updatePreview);
    updatePreview();
    conv.addEventListener("submit", (e) => {
      e.preventDefault();
      const tipos = $$("#conv-tipos input:checked").map((i) => i.value);
      if (!tipos.length) { toast("Selecciona al menos un tipo de sangre"); return; }
      api.CampaignService.sendConvocatoria({ tipos, zona: $("#conv-zona").value, mensaje: $("#conv-mensaje").value }).then((res) => {
        toast(`Convocatoria enviada a ~${res.data.destinatarios.toLocaleString("es-CO")} donantes`);
      });
    });
  }

  /* ─── Arranque ──────────────────────────────────────────────────────────── */
  const safe = (label, fn) => { try { fn(); } catch (e) { console.error("[panel] " + label + ":", e); } };

  function init() {
    if (!api) { console.warn("[panel] Vitalis.api no disponible"); return; }
    safe("roleBanner", roleBanner);
    safe("initTabs", initTabs);
    safe("estadoFilter", () => $("#unit-estado-filter").addEventListener("change", renderUnits));
    safe("loadInventory", loadInventory);
    safe("initDisposalForm", initDisposalForm);
    safe("loadTransfers", loadTransfers);
    safe("initDispatchForm", initDispatchForm);
    safe("initCampaignForms", initCampaignForms);
    icons();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
