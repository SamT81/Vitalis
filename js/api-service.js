/* =============================================================================
   Vitalis · RIBAS — CAPA DE SERVICIOS (js/api-service.js)
   -----------------------------------------------------------------------------
   Controladores de llamadas a la API REST del backend RIBAS. Cada método intenta
   un `fetch` real contra `/api/v1/...` y, si no hay backend disponible, responde
   con datos *mock* de respaldo (modo demostración).

   Uso:
     const { data } = await Vitalis.api.InventoryService.listUnits();

   Controladores: DonorService · CampaignService · InventoryService ·
                  TransferService · AnalyticsService
   ============================================================================= */

(function () {
  "use strict";

  const BLOOD_TYPES = ["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"];
  const REGIONS = ["Bogotá D.C.", "Cundinamarca", "Antioquia", "Valle del Cauca", "Atlántico", "Nacional"];

  /* ─── Cliente HTTP con respaldo mock ──────────────────────────────────────────
     Esta función NUNCA rechaza ni lanza: cualquier fallo (404, 500, red caída,
     CORS, timeout, ausencia de `fetch`, protocolo file://) resuelve con el mock
     de respaldo. Así el renderizado del HTML nunca queda bloqueado.               */
  function toMock(mock, body) {
    try {
      return { source: "mock", data: typeof mock === "function" ? mock(body) : mock };
    } catch (e) {
      console.warn("[Vitalis.api] mock inválido:", e && e.message);
      return { source: "mock", data: null };
    }
  }

  /* Con js/env.js cargado: USE_MOCK = true responde directo con el mock;
     USE_MOCK = false llama al gateway (API_BASE_URL) con el token de sesión. */
  function bearerToken() {
    try {
      const s = JSON.parse(localStorage.getItem("ribas_session"));
      return (s && s.token) || null;
    } catch (_) { return null; }
  }

  async function request(path, mock, options = {}) {
    const body = options.body;
    const env = (window.Vitalis && window.Vitalis.env) || null;
    if (env && env.USE_MOCK) return toMock(mock, body);
    if (typeof fetch !== "function") return toMock(mock, body);

    const headers = { "Accept": "application/json" };
    if (body) headers["Content-Type"] = "application/json";
    const token = env ? bearerToken() : null;
    if (token) headers["Authorization"] = "Bearer " + token;

    let signal;
    try {
      if (typeof AbortController === "function") {
        const controller = new AbortController();
        signal = controller.signal;
        setTimeout(() => { try { controller.abort(); } catch (_) {} }, 1200);
      }
    } catch (_) { /* AbortController no disponible: se continúa sin timeout */ }

    let res;
    try {
      res = await fetch(((env && env.API_BASE_URL) || "") + path, {
        method: options.method || "GET",
        headers: headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: signal,
      });
    } catch (err) {
      // Falla de red / CORS / abort / file:// → mock de respaldo
      return toMock(mock, body);
    }

    // 404, 500, etc. → mock de respaldo (sin lanzar)
    if (!res || !res.ok) return toMock(mock, body);

    let data = null;
    try { data = await res.json(); } catch (_) { data = null; }
    return data == null ? toMock(mock, body) : { source: "api", data: data };
  }

  const qs = (params) => {
    if (!params) return "";
    const s = Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    return s ? "?" + s : "";
  };

  /* ═══════════════════════════ DATOS MOCK DE RESPALDO ═══════════════════════ */

  // Semáforo de disponibilidad por región y tipo (OA-10). nivel: critico | bajo | estable
  function buildSemaforo(seed) {
    return BLOOD_TYPES.map((t, i) => {
      const n = (seed * 7 + i * 13) % 10;
      const nivel = n < 3 ? "critico" : n < 6 ? "bajo" : "estable";
      const unidades = nivel === "critico" ? 4 + (n % 4) : nivel === "bajo" ? 14 + n : 40 + n * 3;
      const cobertura = nivel === "critico" ? 1 : nivel === "bajo" ? 3 : 8; // días de cobertura
      return { tipo: t, nivel, unidades, coberturaDias: cobertura };
    });
  }
  const MOCK_SEMAFORO = {
    "Bogotá D.C.":      buildSemaforo(1),
    "Cundinamarca":     buildSemaforo(4),
    "Antioquia":        buildSemaforo(2),
    "Valle del Cauca":  buildSemaforo(6),
    "Atlántico":        buildSemaforo(9),
    "Nacional":         buildSemaforo(3),
  };

  // Unidades de inventario (OA-06/08/09). estado: apta | tamizaje | no_apta
  const MOCK_UNITS = [
    { id: "U-24801", tipo: "O−",  componente: "Glóbulos rojos", extraccion: "2026-08-12", vencimiento: "2026-09-23", estado: "apta",     banco: "Fundación Santa Fe" },
    { id: "U-24802", tipo: "A+",  componente: "Plasma",         extraccion: "2026-06-30", vencimiento: "2027-06-30", estado: "apta",     banco: "Fundación Santa Fe" },
    { id: "U-24803", tipo: "O+",  componente: "Plaquetas",      extraccion: "2026-08-27", vencimiento: "2026-09-01", estado: "apta",     banco: "Cruz Roja Cundinamarca" },
    { id: "U-24804", tipo: "B−",  componente: "Glóbulos rojos", extraccion: "2026-08-05", vencimiento: "2026-09-16", estado: "tamizaje", banco: "Hospital San Ignacio" },
    { id: "U-24805", tipo: "AB+", componente: "Sangre total",   extraccion: "2026-07-19", vencimiento: "2026-08-30", estado: "no_apta",  banco: "Hospital Militar" },
    { id: "U-24806", tipo: "O−",  componente: "Glóbulos rojos", extraccion: "2026-08-20", vencimiento: "2026-10-01", estado: "apta",     banco: "Cruz Roja Cundinamarca" },
    { id: "U-24807", tipo: "A−",  componente: "Plasma",         extraccion: "2026-08-01", vencimiento: "2027-08-01", estado: "tamizaje", banco: "Fundación Santa Fe" },
    { id: "U-24808", tipo: "B+",  componente: "Plaquetas",      extraccion: "2026-08-28", vencimiento: "2026-09-02", estado: "apta",     banco: "Hospital San Ignacio" },
    { id: "U-24809", tipo: "O+",  componente: "Glóbulos rojos", extraccion: "2026-07-28", vencimiento: "2026-09-08", estado: "apta",     banco: "Hospital Militar" },
    { id: "U-24810", tipo: "AB−", componente: "Sangre total",   extraccion: "2026-08-15", vencimiento: "2026-09-26", estado: "apta",     banco: "Fundación Santa Fe" },
    { id: "U-24811", tipo: "A+",  componente: "Glóbulos rojos", extraccion: "2026-06-18", vencimiento: "2026-08-29", estado: "no_apta",  banco: "Cruz Roja Cundinamarca" },
    { id: "U-24812", tipo: "O−",  componente: "Plaquetas",      extraccion: "2026-08-29", vencimiento: "2026-09-03", estado: "tamizaje", banco: "Hospital San Ignacio" },
  ];

  // Solicitudes de intercambio entre bancos (OA-14/15/16). urgencia: alta | media | baja
  const MOCK_TRANSFER_REQUESTS = [
    { id: "SOL-5012", origen: "Hospital San Ignacio",     destino: "Fundación Santa Fe",       tipo: "O−",  unidades: 6, urgencia: "alta",  estado: "pendiente",  creada: "2026-08-30" },
    { id: "SOL-5013", origen: "Hospital Militar",          destino: "Cruz Roja Cundinamarca",   tipo: "AB−", unidades: 2, urgencia: "media", estado: "pendiente",  creada: "2026-08-30" },
    { id: "SOL-5010", origen: "Clínica del Norte",         destino: "Fundación Santa Fe",       tipo: "O+",  unidades: 10, urgencia: "alta", estado: "aprobada",   creada: "2026-08-29" },
    { id: "SOL-5008", origen: "Hospital San Ignacio",      destino: "Hospital Militar",         tipo: "A+",  unidades: 4, urgencia: "baja",  estado: "despachada", creada: "2026-08-27" },
    { id: "SOL-5006", origen: "Cruz Roja Cundinamarca",    destino: "Clínica del Norte",        tipo: "B−",  unidades: 3, urgencia: "media", estado: "recibida",   creada: "2026-08-25" },
  ];

  // Campañas georreferenciadas (OA-18/19/20). Se enriquecen con región y cupos/turnos.
  function slots(base) {
    return [
      { hora: "08:00", cupos: base },
      { hora: "10:00", cupos: Math.max(0, base - 4) },
      { hora: "12:00", cupos: Math.max(0, base - 9) },
      { hora: "14:00", cupos: base + 2 },
      { hora: "16:00", cupos: Math.max(0, base - 6) },
    ];
  }
  const MOCK_CAMPAIGNS = [
    { id: "C-001", nombre: "Jornada Fundación Santa Fe", sede: "Fundación Santa Fe de Bogotá", region: "Bogotá D.C.", cobertura: "Localidad de Chapinero",
      distancia: "1.2 km", fecha: "2026-09-02", horario: "8:00 a.m. – 4:00 p.m.", estado: "activa", tipos: ["O−", "B−", "AB−"], meta: 80, actual: 52, turnos: slots(10) },
    { id: "C-002", nombre: "Campaña Universitaria Javeriana", sede: "Pontificia Universidad Javeriana, Bogotá", region: "Bogotá D.C.", cobertura: "Localidad de Chapinero",
      distancia: "3.8 km", fecha: "2026-09-05", horario: "9:00 a.m. – 3:00 p.m.", estado: "activa", tipos: ["O+", "A+", "B+"], meta: 120, actual: 42, turnos: slots(14) },
    { id: "C-003", nombre: "Jornada Cruz Roja Cundinamarca", sede: "Cruz Roja Colombiana, Seccional Cundinamarca", region: "Cundinamarca", cobertura: "Soacha y Sabana Occidente",
      distancia: "5.1 km", fecha: "2026-09-08", horario: "7:30 a.m. – 1:00 p.m.", estado: "activa", tipos: ["O−", "O+", "A−", "A+"], meta: 60, actual: 53, turnos: slots(8) },
    { id: "C-004", nombre: "Jornada Centro Comercial Centro Mayor", sede: "Centro Mayor, Bogotá", region: "Bogotá D.C.", cobertura: "Localidad Antonio Nariño",
      distancia: "8.9 km", fecha: "2026-09-20", horario: "10:00 a.m. – 6:00 p.m.", estado: "proxima", tipos: ["AB+", "AB−", "B+"], meta: 100, actual: 12, turnos: slots(16) },
    { id: "C-005", nombre: "Jornada Hospital San Ignacio", sede: "Hospital Universitario San Ignacio, Bogotá", region: "Bogotá D.C.", cobertura: "Localidad de Chapinero",
      distancia: "4.0 km", fecha: "2026-10-04", horario: "8:00 a.m. – 2:00 p.m.", estado: "proxima", tipos: ["O−", "A−", "B−"], meta: 90, actual: 6, turnos: slots(12) },
    { id: "C-006", nombre: "Jornada Parque de la 93", sede: "Parque de la 93, Bogotá", region: "Bogotá D.C.", cobertura: "Localidad de Chapinero",
      distancia: "6.7 km", fecha: "2026-10-18", horario: "9:00 a.m. – 4:00 p.m.", estado: "proxima", tipos: ["O+", "A+", "AB+"], meta: 70, actual: 9, turnos: slots(11) },
    { id: "C-007", nombre: "Jornada Universidad de Antioquia", sede: "Ciudad Universitaria, Medellín", region: "Antioquia", cobertura: "Comuna 10 - La Candelaria",
      distancia: "—", fecha: "2026-09-14", horario: "8:00 a.m. – 3:00 p.m.", estado: "activa", tipos: ["O−", "O+", "A+"], meta: 110, actual: 61, turnos: slots(13) },
    { id: "C-008", nombre: "Jornada Cali - Estadio Pascual Guerrero", sede: "Estadio Pascual Guerrero, Cali", region: "Valle del Cauca", cobertura: "Comuna 19",
      distancia: "—", fecha: "2026-09-27", horario: "9:00 a.m. – 5:00 p.m.", estado: "proxima", tipos: ["B+", "B−", "AB+"], meta: 95, actual: 18, turnos: slots(15) },
  ];

  // Estructura institucional (OA-11/12/13, LI-11)
  const MOCK_BANKS = [
    { id: "BS-01", nombre: "Fundación Santa Fe de Bogotá",           ciudad: "Bogotá D.C.",      categoria: "Banco de sangre A", estado: "activo" },
    { id: "BS-02", nombre: "Cruz Roja Colombiana - Cundinamarca",    ciudad: "Bogotá D.C.",      categoria: "Banco de sangre A", estado: "activo" },
    { id: "BS-03", nombre: "Hospital Universitario San Ignacio",     ciudad: "Bogotá D.C.",      categoria: "Servicio transfusional", estado: "activo" },
    { id: "BS-04", nombre: "Hospital Militar Central",               ciudad: "Bogotá D.C.",      categoria: "Banco de sangre B", estado: "activo" },
    { id: "BS-05", nombre: "IPS Universitaria - Antioquia",          ciudad: "Medellín",         categoria: "Banco de sangre A", estado: "en revisión" },
    { id: "BS-06", nombre: "Hemocentro del Valle",                   ciudad: "Cali",             categoria: "Banco de sangre A", estado: "activo" },
  ];
  const MOCK_INSTITUTIONAL_USERS = [
    { id: "US-101", nombre: "Laura Méndez",   correo: "lmendez@santafe.co",   rol: "Coordinador de banco", banco: "BS-01", estado: "activo" },
    { id: "US-102", nombre: "Carlos Ríos",    correo: "crios@cruzroja.co",    rol: "Analista de inventario", banco: "BS-02", estado: "activo" },
    { id: "US-103", nombre: "Diana Torres",   correo: "dtorres@sanignacio.co",rol: "Responsable de tamizaje", banco: "BS-03", estado: "activo" },
    { id: "US-104", nombre: "Andrés Gómez",   correo: "agomez@hmc.co",        rol: "Coordinador de despachos", banco: "BS-04", estado: "suspendido" },
    { id: "US-105", nombre: "Paula Navarro",  correo: "pnavarro@invima.gov.co",rol: "Inspector regulatorio", banco: "—", estado: "activo" },
  ];

  // Analítica (OA-25/26, LI-10)
  const MOCK_DEMAND_AVAILABILITY = BLOOD_TYPES.map((t, i) => {
    const disponibilidad = 30 + ((i * 17) % 60);
    const demanda = 25 + ((i * 23 + 11) % 70);
    return { tipo: t, disponibilidad, demanda };
  });
  const MOCK_SHORTAGE_PREDICTION = BLOOD_TYPES.map((t, i) => {
    const dias = [2, 12, 4, 20, 3, 16, 9, 25][i];
    const riesgo = dias <= 4 ? "alto" : dias <= 12 ? "medio" : "bajo";
    return { tipo: t, diasParaEscasez: dias, riesgo, tendencia: i % 2 === 0 ? "baja" : "estable" };
  });

  // Auditoría (OA-27/28)
  const MOCK_AUDIT_LOG = [
    { ts: "2026-08-31 09:42", usuario: "lmendez@santafe.co",    accion: "Registro de disposición", entidad: "Unidad U-24805", resultado: "OK" },
    { ts: "2026-08-31 09:15", usuario: "crios@cruzroja.co",     accion: "Aprobación de transferencia", entidad: "SOL-5010", resultado: "OK" },
    { ts: "2026-08-31 08:58", usuario: "system",                accion: "Alerta de vencimiento", entidad: "Unidad U-24803", resultado: "NOTIFICADO" },
    { ts: "2026-08-30 18:20", usuario: "dtorres@sanignacio.co", accion: "Actualización de estado (tamizaje)", entidad: "Unidad U-24804", resultado: "OK" },
    { ts: "2026-08-30 16:04", usuario: "agomez@hmc.co",         accion: "Despacho de transferencia", entidad: "TRF-88031", resultado: "OK" },
    { ts: "2026-08-30 11:31", usuario: "admin@vitalis.co",      accion: "Alta de banco participante", entidad: "BS-06", resultado: "OK" },
    { ts: "2026-08-29 15:47", usuario: "admin@vitalis.co",      accion: "Asignación de rol", entidad: "US-105 → Inspector regulatorio", resultado: "OK" },
    { ts: "2026-08-29 10:12", usuario: "pnavarro@invima.gov.co",accion: "Exportación de informe de trazabilidad", entidad: "Rango 2026-07-01..2026-08-29", resultado: "OK" },
    { ts: "2026-08-28 09:03", usuario: "system",                accion: "Recálculo de predicción de escasez", entidad: "Modelo v3", resultado: "OK" },
  ];

  const MOCK_DONOR_BADGES = [
    { id: "B-01", nombre: "Primer Donante", umbral: 1 },
    { id: "B-02", nombre: "Héroe Bronce", umbral: 5 },
    { id: "B-03", nombre: "Donante Frecuente", umbral: 6 },
    { id: "B-04", nombre: "Héroe de Plata", umbral: 10 },
    { id: "B-05", nombre: "Héroe Platino", umbral: 18 },
    { id: "B-06", nombre: "Héroe de Sangre", umbral: 25 },
  ];

  function estimateRecipients(body) {
    const base = 4200;
    const byType = body && body.tipos ? body.tipos.length : 8;
    const byZone = body && body.zona && body.zona !== "Nacional" ? 0.28 : 1;
    return Math.round((base * (byType / 8) * byZone));
  }

  /* ═══════════════════════════ CONTROLADORES ═══════════════════════════════ */

  const DonorService = {
    getProfile:  (id)        => request(`/api/v1/donors/${id}`, () => (window.Vitalis.auth ? window.Vitalis.auth.getUser() : null)),
    listBadges:  ()          => request(`/api/v1/donors/badges`, () => MOCK_DONOR_BADGES),
    updateProfile: (id, body)=> request(`/api/v1/donors/${id}`, () => ({ ok: true }), { method: "PATCH", body }),
  };

  const CampaignService = {
    list:            (params) => request(`/api/v1/campaigns${qs(params)}`, () => filterCampaigns(MOCK_CAMPAIGNS, params)),
    getSlots:        (id)     => request(`/api/v1/campaigns/${id}/slots`, () => {
                                   const c = MOCK_CAMPAIGNS.find((x) => x.id === id);
                                   return c ? c.turnos : slots(10);
                                 }),
    enroll:          (id, slot) => request(`/api/v1/campaigns/${id}/enroll`, () => ({ ok: true, campaignId: id, turno: slot, confirmacion: "INS-" + Date.now().toString(36).toUpperCase() }), { method: "POST", body: { slot } }),
    createCampaign:  (body)  => request(`/api/v1/campaigns`, () => ({ ok: true, id: "C-" + Date.now().toString(36).toUpperCase() }), { method: "POST", body }),
    sendConvocatoria:(body)  => request(`/api/v1/campaigns/convocatorias`, () => ({ ok: true, destinatarios: estimateRecipients(body) }), { method: "POST", body }),
  };

  function filterCampaigns(list, params) {
    let out = list.slice();
    if (params && params.region && params.region !== "Todas") out = out.filter((c) => c.region === params.region);
    if (params && params.desde) out = out.filter((c) => c.fecha >= params.desde);
    return out;
  }

  const InventoryService = {
    getSemaforo:      (region) => request(`/api/v1/inventory/semaforo${qs({ region })}`, () => MOCK_SEMAFORO[region] || MOCK_SEMAFORO["Nacional"]),
    listUnits:        (params) => request(`/api/v1/inventory/units${qs(params)}`, () => {
                                    let u = MOCK_UNITS.slice();
                                    if (params && params.estado && params.estado !== "todas") u = u.filter((x) => x.estado === params.estado);
                                    return u;
                                  }),
    registerDisposal: (body)  => request(`/api/v1/inventory/disposals`, () => ({ ok: true, folio: "DSP-" + Date.now().toString(36).toUpperCase() }), { method: "POST", body }),
  };

  const TransferService = {
    listRequests: (params) => request(`/api/v1/transfers/requests${qs(params)}`, () => MOCK_TRANSFER_REQUESTS),
    approve:      (id)     => request(`/api/v1/transfers/requests/${id}/approve`, () => ({ ok: true }), { method: "POST" }),
    dispatch:     (body)   => request(`/api/v1/transfers/dispatch`, () => ({ ok: true, guia: "TRF-" + Date.now().toString(36).toUpperCase() }), { method: "POST", body }),
  };

  const AnalyticsService = {
    demandVsAvailability: (region) => request(`/api/v1/analytics/demand-availability${qs({ region })}`, () => MOCK_DEMAND_AVAILABILITY),
    shortagePrediction:   ()       => request(`/api/v1/analytics/shortage-prediction`, () => MOCK_SHORTAGE_PREDICTION),
    auditLog:             (params) => request(`/api/v1/analytics/audit-log${qs(params)}`, () => MOCK_AUDIT_LOG),
    banks:                ()       => request(`/api/v1/analytics/banks`, () => MOCK_BANKS),
    users:                ()       => request(`/api/v1/analytics/users`, () => MOCK_INSTITUTIONAL_USERS),
    exportTraceability:   (params) => request(`/api/v1/analytics/reports/traceability${qs(params)}`, () => ({
                                        generado: new Date().toISOString(),
                                        rango: params || {},
                                        totales: { unidades: MOCK_UNITS.length, transferencias: MOCK_TRANSFER_REQUESTS.length, disposiciones: 2, campanas: MOCK_CAMPAIGNS.length },
                                        eventos: MOCK_AUDIT_LOG,
                                      })),
  };

  /* Accesores SÍNCRONOS a los datos mock, para pintar la interfaz al instante
     mientras (o si) la petición REST responde. Nunca lanzan. */
  const MOCKS = {
    semaforo:             (region) => (MOCK_SEMAFORO[region] || MOCK_SEMAFORO["Nacional"]).slice(),
    units:                ()       => MOCK_UNITS.slice(),
    transferRequests:     ()       => MOCK_TRANSFER_REQUESTS.slice(),
    campaigns:            (params) => filterCampaigns(MOCK_CAMPAIGNS, params),
    demandVsAvailability: ()       => MOCK_DEMAND_AVAILABILITY.slice(),
    shortagePrediction:   ()       => MOCK_SHORTAGE_PREDICTION.slice(),
    auditLog:             ()       => MOCK_AUDIT_LOG.slice(),
    banks:                ()       => MOCK_BANKS.slice(),
    users:                ()       => MOCK_INSTITUTIONAL_USERS.slice(),
    donorBadges:          ()       => MOCK_DONOR_BADGES.slice(),
  };

  /* ═══════════════════════════ API PÚBLICA ═════════════════════════════════ */
  window.Vitalis = window.Vitalis || {};
  window.Vitalis.api = {
    BLOOD_TYPES, REGIONS, MOCKS,
    DonorService, CampaignService, InventoryService, TransferService, AnalyticsService,
  };
})();
