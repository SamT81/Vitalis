/* =============================================================================
   Vitalis · RIBAS — INTERFAZ DEL MÓDULO DE AUTENTICACIÓN (js/auth-ui.js)
   -----------------------------------------------------------------------------
   Comportamiento de las pantallas de cuenta que no cubre js/auth.js:
     · Mostrar / ocultar contraseña            → [data-toggle-password="<id>"]
     · Recuperar contraseña (recuperar.html)   → #forgot-form
     · Mi cuenta y sesión (cuenta.html)        → #account-page

   Depende de: js/auth.js y js/auth-service.js (cargados antes).
   ============================================================================= */

(function () {
  "use strict";

  const V = window.Vitalis || {};
  const auth = V.auth || null;
  const svc  = V.authService || null;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const refreshIcons = () => window.lucide && window.lucide.createIcons();

  /* ─── Mostrar / ocultar contraseña ──────────────────────────────────────── */
  function initPasswordToggles() {
    document.querySelectorAll("[data-toggle-password]").forEach((btn) => {
      const input = document.getElementById(btn.dataset.togglePassword);
      if (!input) return;
      btn.addEventListener("click", () => {
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.setAttribute("aria-pressed", String(show));
        btn.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
        btn.innerHTML = `<i data-lucide="${show ? "eye-off" : "eye"}"></i>`;
        refreshIcons();
      });
    });
  }

  /* ─── Recuperar contraseña ──────────────────────────────────────────────── */
  function initForgotForm() {
    const form = $("#forgot-form");
    if (!form || !svc) return;

    const emailEl  = $("#forgot-email");
    const feedback = $("#forgot-email-error");
    const err      = $("#forgot-error");
    const done     = $("#forgot-success");
    const submit   = form.querySelector('button[type="submit"]');

    emailEl.addEventListener("input", () => emailEl.setCustomValidity(""));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (submit.disabled) return;
      err.classList.remove("show");

      const msg = svc.validateEmail(emailEl.value);
      emailEl.setCustomValidity(msg);
      if (msg) feedback.textContent = msg;
      form.classList.add("was-validated");
      if (msg) { emailEl.focus(); return; }

      const idleHtml = submit.innerHTML;
      submit.disabled = true;
      submit.setAttribute("aria-busy", "true");
      submit.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Enviando…';
      try {
        await svc.forgotPassword(emailEl.value);
        form.hidden = true;
        done.hidden = false;
        done.focus();
      } catch (error) {
        err.textContent = svc.messageFor(error);
        err.classList.add("show");
      } finally {
        submit.disabled = false;
        submit.removeAttribute("aria-busy");
        submit.innerHTML = idleHtml;
        refreshIcons();
      }
    });
  }

  /* ─── Mi cuenta y sesión ────────────────────────────────────────────────── */
  function formatDateTime(iso) {
    return new Date(iso).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });
  }

  function remainingText(ms) {
    const minutes = Math.max(0, Math.floor(ms / 60000));
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h >= 24) return `en ${Math.floor(h / 24)} día(s)`;
    return h ? `en ${h} h ${m} min` : `en ${m} min`;
  }

  function roleTag(text) {
    const tag = document.createElement("span");
    tag.className = "tag tag-rose";
    tag.textContent = text;
    return tag;
  }

  function renderAccount() {
    const page = $("#account-page");
    if (!page || !auth) return;
    const user = auth.getUser();
    if (!user) return;                       // el guardián ya redirige a login

    const session = svc ? svc.getSession() : null;

    $("#account-name").textContent = user.name || "—";
    $("#account-email").textContent = user.email || "—";

    const roles = $("#account-roles");
    roles.textContent = "";
    if (session && session.user.roles.length) {
      session.user.roles.forEach((r) => roles.appendChild(roleTag(svc.roleLabel(r))));
    } else {
      roles.appendChild(roleTag(auth.roleLabel(user.role)));
    }

    const institutionId = (session && session.user.institutionId) || user.institutionId || "";
    $("#account-institution").textContent = user.institution || "Sin institución asociada";
    $("#account-institution-id").textContent = institutionId || "—";

    const expires = $("#account-expires");
    const remaining = $("#account-remaining");
    if (session) {
      const left = Date.parse(session.expiresAt) - Date.now();
      expires.textContent = formatDateTime(session.expiresAt);
      remaining.textContent = "Expira " + remainingText(left);
      // Al vencer se cierra la sesión (setTimeout admite hasta ~24 días).
      if (left < 2147483647) setTimeout(() => { auth.logout(); location.replace("login.html?next=cuenta.html"); }, left);
    } else {
      expires.textContent = "Sin vencimiento";
      remaining.textContent = "Sesión local de demostración (sin token del backend).";
    }

    const home = $("#account-home");
    if (home) home.href = auth.roleHome(auth.getRole());
  }

  function onReady() {
    initPasswordToggles();
    initForgotForm();
    renderAccount();
    refreshIcons();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
