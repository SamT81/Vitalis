/* =============================================================================
   Vitalis · RIBAS — contenido e interactividad de las pantallas (js/main.js)
   -----------------------------------------------------------------------------
   Un único archivo compartido por todas las páginas. Cada función de render
   comprueba primero si su contenedor existe; si no, no hace nada. Depende de
   js/auth.js (cargado antes) para la sesión del donante: window.Vitalis.auth.

   Contenido:
     1.  Datos de ejemplo (mock)
     2.  Utilidades
     3.  HOME · beneficios y pasos
     4.  CAMPAÑAS · tarjetas, progreso, inscripción (con control de sesión)
     5.  GAMIFICACIÓN · sistema de puntos, niveles e impacto de la red
     6.  PERFIL · resumen, medallas, campañas suscritas, historial y certificados
     7.  INFORMACIÓN · requisitos, mitos y realidades, FAQ, buzón de preguntas
     8.  Navegación · menú móvil y scroll suave
     9.  Arranque
   ============================================================================= */

(function () {
  "use strict";

  const auth = (window.Vitalis && window.Vitalis.auth) || null;

  /* ==========================================================================
     1. DATOS DE EJEMPLO (mock)
     ========================================================================== */

  const BENEFITS = [
    { icon: "sparkles", title: "Gamificación real",
      desc: "Gana puntos, sube de nivel y desbloquea insignias de \"Héroe\" cada vez que donas sangre." },
    { icon: "heart-handshake", title: "Impacto personalizado",
      desc: "Entérate exactamente a qué hospital y a cuántas personas ayudó tu última donación." },
    { icon: "map-pin", title: "Campañas cercanas",
      desc: "Encuentra jornadas de la red RIBAS cerca de ti e inscríbete en un clic, sin llamadas ni filas." },
  ];

  const STEPS = [
    { n: "01", title: "Crea tu cuenta",
      desc: "Regístrate como donante con tus datos básicos y tu tipo de sangre en menos de dos minutos." },
    { n: "02", title: "Elige una campaña",
      desc: "Explora las jornadas activas y próximas de la red y reserva tu cupo cuando te convenga." },
    { n: "03", title: "Dona y sigue tu impacto",
      desc: "Acumula puntos, sube de nivel y mira en tiempo real la vida que ayudaste a salvar." },
  ];

  // Jornadas de recolección. status: "activa" | "proxima"
  const CAMPAIGNS = [
    { id: "C-001", name: "Jornada Fundación Santa Fe", location: "Fundación Santa Fe de Bogotá",
      distance: "1.2 km", date: "2026-09-02", time: "8:00 a.m. – 4:00 p.m.", status: "activa",
      bloodTypesNeeded: ["O−", "B−", "AB−"], goal: 80, current: 52 },
    { id: "C-002", name: "Campaña Universitaria Javeriana", location: "Pontificia Universidad Javeriana, Bogotá",
      distance: "3.8 km", date: "2026-09-05", time: "9:00 a.m. – 3:00 p.m.", status: "activa",
      bloodTypesNeeded: ["O+", "A+", "B+"], goal: 120, current: 42 },
    { id: "C-003", name: "Jornada Cruz Roja Cundinamarca", location: "Cruz Roja Colombiana, Seccional Cundinamarca",
      distance: "5.1 km", date: "2026-09-08", time: "7:30 a.m. – 1:00 p.m.", status: "activa",
      bloodTypesNeeded: ["O−", "O+", "A−", "A+"], goal: 60, current: 53 },
    { id: "C-004", name: "Jornada Centro Comercial Centro Mayor", location: "Centro Mayor, Bogotá",
      distance: "8.9 km", date: "2026-09-20", time: "10:00 a.m. – 6:00 p.m.", status: "proxima",
      bloodTypesNeeded: ["AB+", "AB−", "B+"], goal: 100, current: 12 },
    { id: "C-005", name: "Jornada Hospital San Ignacio", location: "Hospital Universitario San Ignacio, Bogotá",
      distance: "4.0 km", date: "2026-10-04", time: "8:00 a.m. – 2:00 p.m.", status: "proxima",
      bloodTypesNeeded: ["O−", "A−", "B−"], goal: 90, current: 6 },
    { id: "C-006", name: "Jornada Parque de la 93", location: "Parque de la 93, Bogotá",
      distance: "6.7 km", date: "2026-10-18", time: "9:00 a.m. – 4:00 p.m.", status: "proxima",
      bloodTypesNeeded: ["O+", "A+", "AB+"], goal: 70, current: 9 },
  ];

  // Catálogo de insignias. Se desbloquean según el número de donaciones del donante.
  const BADGES = [
    { id: "B-01", name: "Primer Donante", icon: "🩸", threshold: 1,
      criteria: "Completa tu primera donación exitosa.",
      benefit: "Desbloquea tu perfil de héroe y 100 puntos de bienvenida." },
    { id: "B-02", name: "Héroe Bronce", icon: "🥉", threshold: 5,
      criteria: "Alcanza 5 donaciones registradas.",
      benefit: "Insignia visible en tu perfil y 150 puntos extra." },
    { id: "B-03", name: "Donante Frecuente", icon: "🔥", threshold: 6,
      criteria: "Dona en 6 convocatorias sin fallar tu fecha disponible.",
      benefit: "Multiplicador de puntos x1.5 en tu próxima donación." },
    { id: "B-04", name: "Héroe de Plata", icon: "🥈", threshold: 10,
      criteria: "Alcanza 10 donaciones registradas.",
      benefit: "Acceso prioritario a jornadas con cupos limitados." },
    { id: "B-05", name: "Héroe Platino", icon: "🏆", threshold: 18,
      criteria: "Alcanza 18 donaciones registradas.",
      benefit: "Prioridad en notificaciones de escasez cercanas." },
    { id: "B-06", name: "Donante Universal", icon: "🌐", threshold: 3, bloodTypeReq: "O−",
      criteria: "Exclusiva para tipo de sangre O−: dona 3 veces en jornadas de emergencia.",
      benefit: "Reconocimiento especial y alerta prioritaria en escasez crítica." },
    { id: "B-07", name: "Héroe de Sangre", icon: "💎", threshold: 25,
      criteria: "Alcanza 25 donaciones registradas.",
      benefit: "Máximo nivel de la red: invitación a los eventos anuales de Vitalis." },
    { id: "B-08", name: "Embajador", icon: "🎗️", threshold: Infinity,
      criteria: "Invita a 3 personas que completen su primera donación.",
      benefit: "Insignia de embajador y mención en el boletín de campañas." },
  ];

  const POINT_RULES = [
    { icon: "droplets",       title: "Donación completada",      pts: "+500 pts", desc: "Por cada donación exitosa registrada en la red." },
    { icon: "share-2",        title: "Compartir una campaña",    pts: "+50 pts",  desc: "Cuando alguien se inscribe desde tu enlace." },
    { icon: "flame",          title: "Mantener tu racha",        pts: "+150 pts", desc: "Por no fallar tu fecha disponible entre jornadas." },
    { icon: "user-plus",      title: "Invitar a un donante",     pts: "+300 pts", desc: "Cuando tu invitado completa su primera donación." },
    { icon: "calendar-check", title: "Asistir a jornada agendada", pts: "+100 pts", desc: "Por llegar a la cita que reservaste." },
    { icon: "siren",          title: "Responder a una alerta",   pts: "+250 pts", desc: "Por donar en una jornada de emergencia por escasez." },
  ];

  const IMPACT_COUNTERS = [
    { icon: "droplets",   value: "17.190 L", label: "Sangre recolectada" },
    { icon: "heart",      value: "9.700",    label: "Vidas asistidas" },
    { icon: "building-2", value: "24",       label: "Bancos de sangre en la red" },
    { icon: "users",      value: "12.400",   label: "Donantes activos" },
  ];

  // Ranking público de instituciones (no personal).
  const LEADERBOARD = [
    { name: "Banco de Sangre · Fundación Santa Fe", sub: "1.980 unidades este año", score: "1.980" },
    { name: "Cruz Roja Colombiana · Cundinamarca",  sub: "1.640 unidades este año", score: "1.640" },
    { name: "Hospital Universitario San Ignacio",   sub: "1.410 unidades este año", score: "1.410" },
    { name: "Banco de Sangre · Hospital Militar",   sub: "1.120 unidades este año", score: "1.120" },
    { name: "Universidad Nacional de Colombia",     sub: "980 unidades este año",   score: "980" },
  ];

  const STATUS_LABEL = { usada: "Usada en transfusión", en_reserva: "En reserva", procesada: "Procesada" };
  const STATUS_TAG   = { usada: "tag-emerald", en_reserva: "tag-sky", procesada: "tag-amber" };

  const REQUIREMENTS = [
    { category: "Requisitos básicos", items: [
      { text: "Tener entre 18 y 65 años", ok: true },
      { text: "Pesar más de 50 kg", ok: true },
      { text: "Estar en buen estado de salud", ok: true },
      { text: "No haber donado en los últimos 2 meses (hombres) o 3 meses (mujeres)", ok: true },
    ]},
    { category: "Antes de donar", items: [
      { text: "Dormir bien la noche anterior (mínimo 6 horas)", ok: true },
      { text: "Desayunar o comer normalmente", ok: true },
      { text: "Beber abundante agua antes de la donación", ok: true },
      { text: "Llevar un documento de identidad vigente", ok: true },
    ]},
    { category: "No puedes donar si", items: [
      { text: "Estás embarazada o amamantando", ok: false },
      { text: "Te hiciste tatuajes o perforaciones en los últimos 12 meses", ok: false },
      { text: "Tienes fiebre o una infección activa", ok: false },
      { text: "Tomaste antibióticos en los últimos 15 días", ok: false },
      { text: "Tuviste una cirugía en los últimos 6 meses", ok: false },
    ]},
  ];

  const MYTHS = [
    { myth: "Donar sangre engorda o adelgaza.",
      reality: "No. La donación no altera tu peso ni tu metabolismo; el cuerpo repone el volumen en 24–48 horas y los glóbulos rojos en unas semanas." },
    { myth: "Si tengo tatuajes nunca podré donar.",
      reality: "Sí puedes: solo debes esperar 12 meses desde el último tatuaje o perforación hecho en un lugar certificado." },
    { myth: "Donar sangre duele mucho y es peligroso.",
      reality: "Solo sientes el pinchazo inicial. El material es estéril y de un solo uso, y personal capacitado supervisa todo el proceso, que dura 8–10 minutos." },
    { myth: "Con gripa o resfriado leve puedo donar igual.",
      reality: "No. Debes estar completamente recuperado y sin fiebre para proteger tanto tu salud como la de quien recibe la sangre." },
    { myth: "Los vegetarianos no pueden donar por falta de hierro.",
      reality: "Pueden donar siempre que su nivel de hemoglobina esté dentro del rango. Se mide antes de cada donación." },
    { myth: "Una sola donación no hace gran diferencia.",
      reality: "Cada unidad se separa en varios componentes y puede ayudar hasta a 3 personas distintas." },
  ];

  const FAQS = [
    { q: "¿Con qué frecuencia puedo donar sangre?",
      a: "En general, cada 2 meses (56 días) para hombres y cada 3 meses para mujeres, según tu último resultado clínico. La plataforma calcula automáticamente tu próxima fecha disponible." },
    { q: "¿Necesito cita previa?",
      a: "No siempre. Puedes inscribirte en una jornada específica desde el módulo de Campañas, o presentarte directamente en un banco de sangre afiliado a la red RIBAS." },
    { q: "¿Qué pasa con mis puntos y niveles?",
      a: "Cada donación exitosa suma puntos y avanza tu progreso hacia el siguiente nivel de \"Héroe\", visibles siempre en tu panel de perfil." },
    { q: "¿Mis resultados de tamizaje son confidenciales?",
      a: "Sí. Los resultados se manejan de forma confidencial conforme al Decreto 1571 de 1993 y nunca se comparten contigo ni con terceros no autorizados." },
  ];


  /* ==========================================================================
     2. UTILIDADES
     ========================================================================== */

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const refreshIcons = () => window.lucide && window.lucide.createIcons();

  const esc = (str) => String(str).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  const pct = (value, total) => Math.max(0, Math.min(100, Math.round((value / total) * 100)));

  const MONTHS = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  function formatLong(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} de ${MONTHS[m - 1]} de ${y}`;
  }

  function heroLevel(donations) {
    if (donations >= 25) return "Héroe de Sangre";
    if (donations >= 18) return "Héroe Platino";
    if (donations >= 10) return "Héroe de Plata";
    if (donations >= 5)  return "Héroe Bronce";
    if (donations >= 1)  return "Donante activo";
    return "Donante nuevo";
  }

  function badgeUnlocked(badge, donations, bloodType) {
    if (badge.bloodTypeReq && bloodType !== badge.bloodTypeReq) return false;
    if (!isFinite(badge.threshold)) return false;
    return donations >= badge.threshold;
  }


  /* ==========================================================================
     3. HOME
     ========================================================================== */

  function renderBenefits() {
    const grid = $("#benefits-grid");
    if (!grid) return;
    grid.innerHTML = BENEFITS.map((b) => `
      <div class="col-12 col-md-4">
        <article class="benefit-card">
          <span class="benefit-ico"><i data-lucide="${b.icon}"></i></span>
          <h3>${esc(b.title)}</h3>
          <p>${esc(b.desc)}</p>
        </article>
      </div>`).join("");
  }

  function renderSteps() {
    const grid = $("#steps-grid");
    if (!grid) return;
    grid.innerHTML = STEPS.map((s) => `
      <div class="col-12 col-md-4">
        <div class="step">
          <span class="step-num">${esc(s.n)}</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.desc)}</p>
        </div>
      </div>`).join("");
  }


  /* ==========================================================================
     4. CAMPAÑAS
     ========================================================================== */

  let campaignView = "lista"; // "lista" | "mapa"

  function visibleCampaigns() {
    const input = $("#campaign-filter");
    const from = input ? input.value : "";
    return CAMPAIGNS.filter((c) => !from || c.date >= from);
  }

  /** current mostrado = base del mock + 1 si el donante en sesión está inscrito. */
  function shownCurrent(c) {
    return c.current + (auth && auth.isEnrolled(c.id) ? 1 : 0);
  }

  function onEnrollClick(id) {
    if (!auth || !auth.isAuthenticated()) {
      location.href = "login.html?next=campanas.html";
      return;
    }
    auth.toggleEnrollment(id);
    renderCampaigns();
  }

  function campaignCardHtml(c) {
    const enrolled = !!(auth && auth.isEnrolled(c.id));
    const authed   = !!(auth && auth.isAuthenticated());
    const cur = shownCurrent(c);
    const p = pct(cur, c.goal);

    let btn;
    if (!authed) {
      btn = `<button class="btn-enroll" data-enroll="${c.id}" type="button">
               <i data-lucide="lock"></i> Inicia sesión para inscribirte
             </button>`;
    } else if (enrolled) {
      btn = `<button class="btn-enroll is-enrolled" data-enroll="${c.id}" type="button">
               ✓ Inscrito — Cancelar inscripción
             </button>`;
    } else {
      btn = `<button class="btn-enroll" data-enroll="${c.id}" type="button">
               <i data-lucide="calendar-plus"></i> Inscribirme a esta campaña
             </button>`;
    }

    return `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="campaign-card ${enrolled ? "is-enrolled" : ""}">
          <div class="cc-head">
            <div>
              <div class="cc-name">${esc(c.name)}</div>
              <div class="cc-loc"><i data-lucide="map-pin"></i>${esc(c.location)}</div>
            </div>
            <div class="text-end flex-shrink-0">
              <div class="cc-dist">${esc(c.distance)}</div>
              ${enrolled ? '<span class="badge-inscrito">Inscrito</span>' : ""}
            </div>
          </div>

          <div class="cc-datetime">
            <span><i data-lucide="calendar"></i>${esc(formatLong(c.date))}</span>
            <span><i data-lucide="clock"></i>${esc(c.time)}</span>
          </div>

          <div class="cc-progress">
            <div class="cc-progress-head">
              <span class="cc-progress-pct">${p}% de la meta</span>
              <span class="cc-progress-goal">${cur}/${c.goal} donaciones</span>
            </div>
            <div class="cc-bar"><div style="width:${p}%"></div></div>
            <p class="cc-progress-hint">Faltan ${Math.max(0, c.goal - cur)} donaciones para alcanzar la meta</p>
          </div>

          <div class="cc-types">
            ${c.bloodTypesNeeded.map((bt) => `<span class="bt-chip">${esc(bt)}</span>`).join("")}
          </div>

          ${btn}
        </div>
      </div>`;
  }

  function campaignGroupHtml(title, dotClass, list) {
    if (!list.length) return "";
    return `
      <h2 class="group-title">
        <span class="group-dot ${dotClass}"></span>${esc(title)}
        <span class="count">${list.length}</span>
      </h2>
      <div class="row g-4">${list.map(campaignCardHtml).join("")}</div>`;
  }

  function campaignMapHtml(list) {
    if (!list.length) return '<p class="text-muted-soft small p-4 mb-0">No hay jornadas para la fecha seleccionada.</p>';
    return `
      <div class="map-pins">
        ${list.map((c, i) => {
          const enrolled = !!(auth && auth.isEnrolled(c.id));
          return `
          <div class="map-pin ${enrolled ? "is-enrolled" : ""}" style="transform:translateY(${(i % 2) * 18}px)">
            <span class="mp-dot"><i data-lucide="map-pin"></i></span>
            <span class="mp-name">${esc(c.name)}</span>
            <span class="mp-dist">${esc(c.distance)}</span>
          </div>`;
        }).join("")}
      </div>
      <div class="map-note">Vista previa de mapa · se conecta a un proveedor de mapas real en producción</div>`;
  }

  function renderCampaigns() {
    const listEl = $("#campaigns-list");
    if (!listEl) return;
    const mapEl = $("#campaigns-map");
    const list = visibleCampaigns();
    const activas  = list.filter((c) => c.status === "activa");
    const proximas = list.filter((c) => c.status === "proxima");

    const meta = $("#campaigns-meta");
    if (meta) meta.textContent = `Bogotá y Cundinamarca · ${activas.length} activas · ${proximas.length} próximas`;

    const clearBtn = $("#clear-filter");
    const filterInput = $("#campaign-filter");
    if (clearBtn && filterInput) clearBtn.classList.toggle("d-none", !filterInput.value);

    const showMap = campaignView === "mapa";
    listEl.classList.toggle("d-none", showMap);
    if (mapEl) mapEl.classList.toggle("d-none", !showMap);

    if (showMap && mapEl) {
      mapEl.innerHTML = campaignMapHtml(list);
    } else {
      listEl.innerHTML =
        (campaignGroupHtml("Campañas activas", "is-live", activas) +
         campaignGroupHtml("Próximas campañas", "is-soon", proximas)) ||
        '<p class="text-muted-soft small mb-0">No hay jornadas para la fecha seleccionada.</p>';
      $$("[data-enroll]", listEl).forEach((btn) => {
        btn.addEventListener("click", () => onEnrollClick(btn.dataset.enroll));
      });
    }

    $$(".view-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.view === campaignView));
    refreshIcons();
  }

  function initCampaignControls() {
    if (!$("#campaigns-list")) return;
    $$(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => { campaignView = btn.dataset.view; renderCampaigns(); });
    });
    const filterInput = $("#campaign-filter");
    if (filterInput) filterInput.addEventListener("change", renderCampaigns);
    const clearBtn = $("#clear-filter");
    if (clearBtn) clearBtn.addEventListener("click", () => { $("#campaign-filter").value = ""; renderCampaigns(); });
  }


  /* ==========================================================================
     5. GAMIFICACIÓN (explicación general de la red)
     ========================================================================== */

  function renderPointRules() {
    const rules = $("#points-rules");
    if (!rules) return;
    rules.innerHTML = POINT_RULES.map((r) => `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="point-rule">
          <span class="pr-ico"><i data-lucide="${r.icon}"></i></span>
          <div class="min-w-0">
            <div class="d-flex align-items-center gap-2">
              <span class="pr-title">${esc(r.title)}</span>
              <span class="pr-pts">${esc(r.pts)}</span>
            </div>
            <div class="pr-desc">${esc(r.desc)}</div>
          </div>
        </div>
      </div>`).join("");
  }

  function renderHeroLevels() {
    const grid = $("#hero-levels");
    if (!grid) return;
    grid.innerHTML = BADGES.map((b) => `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="hero-level">
          <div class="hl-icon">${b.icon}</div>
          <div class="hl-name">${esc(b.name)}</div>
          <p class="hl-req">${esc(b.criteria)}</p>
          <p class="hl-benefit"><b>Beneficio:</b> ${esc(b.benefit)}</p>
        </div>
      </div>`).join("");
  }

  function renderImpact() {
    const counters = $("#impact-counters");
    if (counters) {
      counters.innerHTML = IMPACT_COUNTERS.map((c) => `
        <div class="impact-counter">
          <i data-lucide="${c.icon}"></i>
          <div class="ic-value">${esc(c.value)}</div>
          <div class="ic-label">${esc(c.label)}</div>
        </div>`).join("");
    }
    const board = $("#leaderboard");
    if (board) {
      board.innerHTML = LEADERBOARD.map((row, i) => `
        <div class="lb-row">
          <span class="lb-rank ${i < 3 ? "top" : ""}">${i + 1}</span>
          <div class="lb-name">${esc(row.name)}<small>${esc(row.sub)}</small></div>
          <span class="lb-score">${esc(row.score)}</span>
        </div>`).join("");
    }
  }


  /* ==========================================================================
     6. PERFIL (panel privado del donante)
     ========================================================================== */

  let certModal = null;

  function renderPerfil() {
    const page = $("#perfil-page");
    if (!page || !auth) return;
    const user = auth.getUser();
    if (!user) return; // el guardián de auth.js ya redirige

    const donations = user.donations || 0;
    const lives = donations * 3;

    // Saludo
    $("#perfil-greeting").textContent = `Hola, ${user.name.split(/\s+/)[0]} 👋`;

    // Tarjeta de identidad
    $("#perfil-initials").textContent = auth.initials(user.name);
    $("#perfil-name").textContent = user.name;
    $("#perfil-level").textContent = heroLevel(donations);
    $("#perfil-blood").textContent = user.bloodType;
    $("#perfil-city").textContent = user.city || "—";

    // Mi Resumen
    $("#perfil-summary").innerHTML = [
      { icon: "zap",     cls: "st-sky",     label: "Puntos acumulados",  value: `${(user.points || 0).toLocaleString("es-CO")} pts` },
      { icon: "droplets",cls: "st-rose",    label: "Tipo de sangre",     value: user.bloodType },
      { icon: "heart",   cls: "st-rose",    label: "Donaciones realizadas", value: String(donations) },
      { icon: "activity",cls: "st-emerald", label: "Vidas salvadas (est.)", value: String(lives) },
    ].map((t) => `
      <div class="col-6 col-lg-3">
        <div class="stat-tile ${t.cls}">
          <i data-lucide="${t.icon}"></i>
          <div><div class="st-label">${esc(t.label)}</div><div class="st-value">${esc(t.value)}</div></div>
        </div>
      </div>`).join("");

    renderPerfilBadges(user);
    renderPerfilCampaigns(user);
    renderPerfilHistory(user);
  }

  let selectedBadge = null;

  function renderPerfilBadges(user) {
    const grid = $("#perfil-badges");
    if (!grid) return;
    const d = user.donations || 0;
    const unlockedList = BADGES.filter((b) => badgeUnlocked(b, d, user.bloodType));
    if (!selectedBadge) selectedBadge = unlockedList[unlockedList.length - 1] || BADGES[0];

    $("#perfil-badges-count").textContent = `${unlockedList.length} / ${BADGES.length} desbloqueadas`;

    grid.innerHTML = BADGES.map((b) => {
      const on = badgeUnlocked(b, d, user.bloodType);
      return `<button class="badge-btn ${b.id === selectedBadge.id ? "is-active" : ""} ${on ? "" : "is-locked"}"
                type="button" data-badge="${b.id}" title="${esc(b.name)}">${b.icon}</button>`;
    }).join("");

    $$(".badge-btn", grid).forEach((btn) => {
      const pick = () => {
        selectedBadge = BADGES.find((b) => b.id === btn.dataset.badge);
        $$(".badge-btn", grid).forEach((el) => el.classList.toggle("is-active", el === btn));
        paintBadgeDetail(user);
      };
      btn.addEventListener("click", pick);
      btn.addEventListener("mouseenter", pick);
    });
    paintBadgeDetail(user);
  }

  function paintBadgeDetail(user) {
    const el = $("#perfil-badge-detail");
    if (!el) return;
    const b = selectedBadge;
    const on = badgeUnlocked(b, user.donations || 0, user.bloodType);
    el.innerHTML = `
      <div class="bd-ico ${on ? "" : "is-locked"}">${b.icon}</div>
      <div class="min-w-0">
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <span class="bd-name">${esc(b.name)}</span>
          <span class="chip ${on ? "chip-unlocked" : "chip-locked"}">${on ? "Desbloqueada" : "Por desbloquear"}</span>
        </div>
        <p><b>Criterio:</b> ${esc(b.criteria)}</p>
        <p><b>Beneficio:</b> ${esc(b.benefit)}</p>
      </div>`;
  }

  function renderPerfilCampaigns(user) {
    const wrap = $("#perfil-campaigns");
    if (!wrap) return;
    const mine = (user.enrollments || [])
      .map((id) => CAMPAIGNS.find((c) => c.id === id))
      .filter(Boolean)
      .sort((a, b) => a.date.localeCompare(b.date));

    $("#perfil-campaigns-count").textContent = `${mine.length} ${mine.length === 1 ? "campaña" : "campañas"}`;

    if (!mine.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <i data-lucide="calendar-x"></i>
          <div>Aún no te has inscrito a ninguna campaña.</div>
          <a class="btn btn-outline-soft btn-sm mt-3" href="campanas.html">Explorar campañas</a>
        </div>`;
      return;
    }

    wrap.innerHTML = mine.map((c) => `
      <div class="subscribed-item">
        <div class="min-w-0">
          <div class="si-name">${esc(c.name)}</div>
          <div class="si-meta"><i data-lucide="map-pin"></i>${esc(c.location)}</div>
          <div class="si-meta"><i data-lucide="calendar"></i>Próxima fecha: ${esc(formatLong(c.date))} · ${esc(c.time)}</div>
        </div>
        <div class="si-right">
          <span class="tag tag-emerald">Confirmada</span>
          <button class="btn-unsub" data-unsub="${c.id}" type="button">Cancelar</button>
        </div>
      </div>`).join("");

    $$("[data-unsub]", wrap).forEach((btn) => {
      btn.addEventListener("click", () => {
        auth.toggleEnrollment(btn.dataset.unsub);
        renderPerfil();
        refreshIcons();
      });
    });
  }

  function renderPerfilHistory(user) {
    const wrap = $("#perfil-history");
    if (!wrap) return;
    const rows = user.history || [];
    $("#perfil-history-count").textContent = `${rows.length} ${rows.length === 1 ? "registro" : "registros"}`;

    if (!rows.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <i data-lucide="clipboard-list"></i>
          <div>Aún no registras donaciones. Cuando completes tu primera jornada, aparecerá aquí con su certificado.</div>
        </div>`;
      return;
    }

    wrap.innerHTML = `
      <div class="history-scroll">
        <table class="history-table">
          <thead>
            <tr><th>Fecha</th><th>Lugar</th><th>Componente</th><th>Estado</th><th>Certificado</th></tr>
          </thead>
          <tbody>
            ${rows.map((r, i) => `
              <tr>
                <td>${esc(r.date)}</td>
                <td class="ht-place">${esc(r.place)}</td>
                <td>${esc(r.component)}</td>
                <td><span class="tag ${STATUS_TAG[r.status] || "tag-slate"}">${esc(STATUS_LABEL[r.status] || r.status)}</span></td>
                <td><button class="btn-cert" data-cert="${i}" type="button"><i data-lucide="award"></i> Ver</button></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;

    $$("[data-cert]", wrap).forEach((btn) => {
      btn.addEventListener("click", () => openCertificate(rows[Number(btn.dataset.cert)], user));
    });
  }

  function openCertificate(record, user) {
    const body = $("#cert-content");
    if (!body) return;
    body.innerHTML = `
      <div class="cert-sheet">
        <img class="cert-mark" src="assets/logo-vitalis.png" alt="Logo Vitalis" />
        <h3>Certificado de donación</h3>
        <div class="cert-sub">Vitalis · Red RIBAS</div>
        <p class="cert-body">
          Vitalis certifica que <b>${esc(user.name)}</b> realizó una donación voluntaria de
          <b>${esc(record.component.toLowerCase())}</b> el <b>${esc(record.date)}</b>
          en <b>${esc(record.place)}</b>.
          <br />Gracias por ayudar a salvar vidas.
        </p>
        <div class="cert-id">Folio ${esc(record.cert || "—")} · Documento del donante: ${esc(user.document || "—")}</div>
      </div>`;
    if (!certModal) certModal = new bootstrap.Modal($("#certModal"));
    refreshIcons();
    certModal.show();
  }


  /* ==========================================================================
     7. INFORMACIÓN
     ========================================================================== */

  function renderRequirements() {
    const grid = $("#requirements-grid");
    if (!grid) return;
    grid.innerHTML = REQUIREMENTS.map((group) => `
      <div class="col-12 col-md-4">
        <div class="req-card">
          <h3>${esc(group.category)}</h3>
          <ul class="req-list">
            ${group.items.map((it) => `
              <li class="${it.ok ? "req-yes" : "req-no"}">
                <i data-lucide="${it.ok ? "circle-check" : "circle-x"}"></i>
                <span>${esc(it.text)}</span>
              </li>`).join("")}
          </ul>
        </div>
      </div>`).join("");
  }

  function renderMyths() {
    const grid = $("#myths-grid");
    if (!grid) return;
    grid.innerHTML = MYTHS.map((m, i) => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="myth-card" data-myth="${i}" role="button" tabindex="0" aria-expanded="false">
          <span class="mc-tag"><i data-lucide="x"></i> Mito</span>
          <div class="mc-myth">${esc(m.myth)}</div>
          <div class="myth-reveal">
            <span class="mr-tag"><i data-lucide="check"></i> Realidad</span>
            <p>${esc(m.reality)}</p>
          </div>
          <button class="myth-toggle" type="button" tabindex="-1">
            <span class="myth-toggle-label">Ver la realidad</span> <i data-lucide="chevron-down"></i>
          </button>
        </div>
      </div>`).join("");

    $$(".myth-card", grid).forEach((card) => {
      const toggle = () => {
        const open = card.classList.toggle("is-open");
        card.setAttribute("aria-expanded", String(open));
        const label = $(".myth-toggle-label", card);
        if (label) label.textContent = open ? "Ocultar" : "Ver la realidad";
      };
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });
  }

  function renderFaq() {
    const acc = $("#faqAccordion");
    if (!acc) return;
    acc.innerHTML = FAQS.map((f, i) => `
      <div class="accordion-item">
        <h3 class="accordion-header" id="faq-h${i}">
          <button class="accordion-button ${i === 0 ? "" : "collapsed"}" type="button"
                  data-bs-toggle="collapse" data-bs-target="#faq-c${i}"
                  aria-expanded="${i === 0}" aria-controls="faq-c${i}">
            ${esc(f.q)}
          </button>
        </h3>
        <div id="faq-c${i}" class="accordion-collapse collapse ${i === 0 ? "show" : ""}"
             aria-labelledby="faq-h${i}" data-bs-parent="#faqAccordion">
          <div class="accordion-body">${esc(f.a)}</div>
        </div>
      </div>`).join("");
  }

  function initQuestionForm() {
    const form = $("#question-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      const ok = form.checkValidity();
      $("#question-success").hidden = !ok;
      if (ok) { form.reset(); form.classList.remove("was-validated"); $("#question-success").hidden = false; }
    });
  }


  /* ==========================================================================
     7b. LOGIN — selector de rol (login.html)
     ========================================================================== */

  const ROLE_CONTENT = {
    donante: {
      title: "Iniciar sesión",
      subtitle: "Accede a tu panel de donante para ver tus puntos, medallas y campañas.",
      demoLabel: "Entrar con la cuenta de demostración",
      showRegister: true,
    },
    operativo: {
      title: "Acceso operativo",
      subtitle: "Accede al panel operativo de tu banco de sangre o centro de salud.",
      demoLabel: "Entrar con la cuenta demo de Personal Operativo",
      showRegister: false,
    },
    admin_institucional: {
      title: "Acceso institucional",
      subtitle: "Administra la sede y el personal de tu institución en la red RIBAS.",
      demoLabel: "Entrar con la cuenta demo de Admin. Institucional",
      showRegister: false,
    },
    auditor: {
      title: "Acceso de auditoría",
      subtitle: "Consulta en modo de solo lectura la trazabilidad regulatoria de la red RIBAS.",
      demoLabel: "Entrar con la cuenta demo de Auditor INVIMA",
      showRegister: false,
    },
    admin_general: {
      title: "Acceso de superadministrador",
      subtitle: "Administra la plataforma Vitalis y todas las instituciones de la red RIBAS.",
      demoLabel: "Entrar con la cuenta demo de Admin. General",
      showRegister: false,
    },
  };

  function initRoleSelector() {
    const pills = $$(".role-pill");
    if (!pills.length) return;

    const titleEl    = $("#auth-title");
    const subtitleEl = $("#auth-subtitle");
    const demoBtn    = $("#login-demo");
    const demoEmail  = $("#demo-email");
    const demoPass   = $("#demo-password");
    const staffNote  = $("#auth-staff-note");
    const switchEl   = $("#auth-switch");

    function applyRole(role) {
      const content = ROLE_CONTENT[role];
      if (!content) return;

      pills.forEach((p) => {
        const active = p.dataset.role === role;
        p.classList.toggle("active", active);
        p.setAttribute("aria-selected", String(active));
      });

      if (titleEl) titleEl.textContent = content.title;
      if (subtitleEl) subtitleEl.textContent = content.subtitle;
      if (demoBtn) { demoBtn.textContent = content.demoLabel; demoBtn.dataset.role = role; }
      if (switchEl) switchEl.hidden = !content.showRegister;
      if (staffNote) staffNote.hidden = content.showRegister;

      const demo = auth && auth.DEMOS && auth.DEMOS[role];
      if (demo) {
        if (demoEmail) demoEmail.textContent = demo.email;
        if (demoPass) demoPass.textContent = demo.password;
      }
    }

    pills.forEach((p) => p.addEventListener("click", () => applyRole(p.dataset.role)));

    applyRole("donante");
  }


  /* ==========================================================================
     8. NAVEGACIÓN — menú móvil y scroll suave para anclas de la misma página
     ========================================================================== */

  function initNav() {
    const navCollapseEl = $("#navMenu");
    $$('a[href^="#"]').forEach((link) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      link.addEventListener("click", (e) => {
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        const openCollapse = navCollapseEl && window.bootstrap && bootstrap.Collapse.getInstance(navCollapseEl);
        if (openCollapse && navCollapseEl.classList.contains("show")) openCollapse.hide();
      });
    });
  }


  /* ==========================================================================
     9. ARRANQUE
     ========================================================================== */

  function init() {
    renderBenefits();
    renderSteps();

    renderCampaigns();
    initCampaignControls();

    renderPointRules();
    renderHeroLevels();
    renderImpact();

    renderPerfil();

    renderRequirements();
    renderMyths();
    renderFaq();
    initQuestionForm();

    initRoleSelector();

    initNav();
    refreshIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
