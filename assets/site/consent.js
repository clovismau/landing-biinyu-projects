/* Banner y preferencias de cookies — Biinyu Studio.
   Un solo archivo para todas las páginas: trae su propio CSS y marcado.
   La elección se guarda en localStorage ("biinyu_consent") durante 12 meses.
   Subir VERSION vuelve a preguntar a todo el mundo: hazlo si algún día se
   añade una herramienta opcional (analítica, píxeles) y nómbrala en cookies.html.
   Para cargar algo opcional solo con permiso:
     if (window.BiinyuConsent && BiinyuConsent.has('analytics')) { ... }
     document.addEventListener('biinyu:consent', e => { if (e.detail.analytics) { ... } });
   Cualquier elemento con [data-cookie-settings] abre el panel. */
(function () {
  'use strict';
  if (window.BiinyuConsent) return;

  const KEY = 'biinyu_consent';
  const VERSION = 1;
  const MAX_AGE = 365 * 24 * 60 * 60 * 1000;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let base = '';
  try {
    const s = document.currentScript;
    if (s && s.src) base = new URL('../../', s.src).href;
  } catch (e) {}

  function read() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      if (v && v.v === VERSION && Date.now() - v.ts < MAX_AGE) return v;
    } catch (e) {}
    return null;
  }
  function write(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }

  let current = read();
  const T = (es, en) => `<span data-l="es">${es}</span><span data-l="en">${en}</span>`;

  const ICON = `<svg class="bcb-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path d="M10 6h22A10 10 0 0 0 42 16v22a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z" fill="#E07820"/>
    <path d="M6 33h36v5a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="#000" opacity=".16"/>
    <rect x="14" y="17" width="5" height="11" rx="1.5" fill="#fff"/>
    <rect x="26" y="17" width="5" height="11" rx="1.5" fill="#fff"/>
    <rect x="40" y="3" width="4" height="4" rx="1" fill="#E07820"/>
    <rect x="45" y="9" width="3" height="3" rx="1" fill="#E07820" opacity=".7"/>
  </svg>`;

  const CSS = `
.bcb,.bcb-dialog{--bcb-yellow:#FAE33D;--bcb-ink:#040A12;--bcb-slate:#44556C;font-family:"Poppins",system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff;-webkit-font-smoothing:antialiased;text-align:left}
.bcb *,.bcb-dialog *{box-sizing:border-box}
.bcb [data-l],.bcb-dialog [data-l]{display:none}
html:not([lang="en"]) .bcb [data-l="es"],html:not([lang="en"]) .bcb-dialog [data-l="es"],
html[lang="en"] .bcb [data-l="en"],html[lang="en"] .bcb-dialog [data-l="en"]{display:inline}
.bcb :focus-visible,.bcb-dialog :focus-visible{outline:2px solid var(--bcb-yellow);outline-offset:3px;border-radius:8px}
.bcb{position:fixed;z-index:2147483000;left:max(16px,env(safe-area-inset-left));bottom:max(16px,env(safe-area-inset-bottom));width:min(540px,calc(100vw - 32px));
  opacity:0;transform:translateY(18px);transition:opacity .45s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
.bcb.is-in{opacity:1;transform:none}
.bcb[hidden]{display:none}
.bcb-card{display:grid;grid-template-columns:auto 1fr;gap:14px 16px;padding:20px 20px 18px;border-radius:22px;background:rgba(9,17,28,.92);
  border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.06);
  -webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2)}
.bcb-icon{display:block;width:46px;height:46px;margin-top:2px}
.bcb-title{margin:0 0 6px;font:700 1.05rem/1.25 "Poppins",system-ui,sans-serif;letter-spacing:0;color:#fff}
.bcb-text{margin:0;font:400 .875rem/1.55 "Poppins",system-ui,sans-serif;color:rgba(255,255,255,.78)}
.bcb a,.bcb-dialog a{color:var(--bcb-yellow);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}
.bcb-actions{grid-column:1 / -1;display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.bcb-btn{flex:0 0 auto;min-height:46px;margin:0;padding:0 20px;border:0;border-radius:14px;font:700 .95rem/1 "Poppins",system-ui,sans-serif;letter-spacing:0;cursor:pointer;
  box-shadow:inset 0 -5px 5px rgba(0,0,0,.25),inset 0 0 0 1.5px var(--bcb-edge);
  transition:filter .25s ease,background-color .25s ease,transform .15s ease,box-shadow .15s ease}
.bcb-btn:active{transform:translateY(1px);box-shadow:inset 0 -2px 4px rgba(0,0,0,.25),inset 0 0 0 1.5px var(--bcb-edge)}
.bcb-btn--primary{--bcb-edge:rgba(0,0,0,.2);background:var(--bcb-yellow);color:var(--bcb-ink)}
.bcb-btn--primary:hover{filter:brightness(1.06)}
.bcb-btn--secondary{--bcb-edge:rgba(255,255,255,.1);background:var(--bcb-slate);color:#fff}
.bcb-btn--secondary:hover{background:#4E6079}
.bcb-btn--ghost{--bcb-edge:rgba(255,255,255,.24);background:transparent;color:#fff;box-shadow:inset 0 0 0 1.5px var(--bcb-edge)}
.bcb-btn--ghost:hover{background:rgba(255,255,255,.07)}
.bcb-btn--ghost:active{box-shadow:inset 0 0 0 1.5px var(--bcb-edge)}
.bcb-link{margin:0 auto 0 0;padding:6px 2px;border:0;background:none;font:600 .875rem/1.2 "Poppins",system-ui,sans-serif;color:rgba(255,255,255,.8);
  text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px;cursor:pointer;transition:color .2s ease}
.bcb-link:hover{color:var(--bcb-yellow)}
.bcb-dialog{width:min(580px,calc(100vw - 24px));max-width:none;max-height:min(88svh,780px);margin:auto;padding:0;overflow:auto;overscroll-behavior:contain;
  border:1px solid rgba(255,255,255,.12);border-radius:24px;background:#0A1522;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.bcb-dialog::backdrop{background:rgba(4,10,18,.72);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.bcb-dialog[open]{animation:bcb-pop .4s cubic-bezier(.22,1,.36,1)}
@keyframes bcb-pop{from{opacity:0;transform:translateY(14px) scale(.98)}}
.bcb-dlg{padding:24px}
.bcb-dlg-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 8px}
.bcb-dlg-head h2{margin:0;font:700 1.3rem/1.2 "Poppins",system-ui,sans-serif;letter-spacing:0;color:#fff}
.bcb-close{flex:none;display:grid;place-items:center;width:40px;height:40px;margin:0;padding:0;border:0;border-radius:12px;background:rgba(255,255,255,.07);color:#fff;cursor:pointer;transition:background-color .2s ease}
.bcb-close:hover{background:rgba(255,255,255,.14)}
.bcb-close svg{width:18px;height:18px;display:block}
.bcb-intro{margin:0 0 18px;font:400 .9rem/1.6 "Poppins",system-ui,sans-serif;color:rgba(255,255,255,.74)}
.bcb-cats{list-style:none;display:grid;gap:10px;margin:0 0 20px;padding:0}
.bcb-cat{padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.bcb-cat-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
label.bcb-cat-head{cursor:pointer}
.bcb-cat-name{font:700 .95rem/1.3 "Poppins",system-ui,sans-serif;color:#fff}
.bcb-cat p{margin:6px 0 0;font:400 .82rem/1.55 "Poppins",system-ui,sans-serif;color:rgba(255,255,255,.66)}
.bcb-always{flex:none;padding:6px 10px;border-radius:999px;background:rgba(250,227,61,.12);color:var(--bcb-yellow);font:600 .72rem/1 "Poppins",system-ui,sans-serif;letter-spacing:.02em}
.bcb-switch{-webkit-appearance:none;appearance:none;flex:none;position:relative;width:46px;height:26px;margin:0;border-radius:999px;background:#2A3748;
  box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.14);cursor:pointer;transition:background-color .25s ease}
.bcb-switch::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,.3);
  transition:transform .35s cubic-bezier(.22,1,.36,1),background-color .25s ease}
.bcb-switch:checked{background:var(--bcb-yellow)}
.bcb-switch:checked::after{transform:translateX(20px);background:var(--bcb-ink)}
.bcb-dlg-actions{display:flex;flex-wrap:wrap;gap:10px}
.bcb-dlg-actions .bcb-btn{flex:1 1 150px}
@media (max-width:560px){
  .bcb{left:12px;right:12px;width:auto;bottom:max(12px,env(safe-area-inset-bottom))}
  .bcb-card{gap:12px 14px;padding:18px 16px 14px;border-radius:20px}
  .bcb-icon{width:40px;height:40px}
  .bcb-btn{flex:1 1 0;min-width:0;padding:0 10px;font-size:.9rem}
  .bcb-link{order:3;flex:0 0 100%;margin:0;text-align:center}
  .bcb-dlg{padding:20px 16px}
  .bcb-dlg-actions{flex-direction:column}
  .bcb-dlg-actions .bcb-btn{flex:0 0 auto;width:100%;white-space:nowrap}
}
@media (prefers-reduced-motion:reduce){
  .bcb{transition:none}
  .bcb-dialog[open]{animation:none}
  .bcb-switch,.bcb-switch::after{transition:none}
}`;

  const policyHref = base + 'cookies.html';
  const privacyHref = base + 'privacidad.html';

  const BANNER = `
<section class="bcb" aria-labelledby="bcb-title" hidden>
  <div class="bcb-card">
    ${ICON}
    <div class="bcb-body">
      <h2 class="bcb-title" id="bcb-title">${T('Antes de empezar la partida', 'Before you start the game')}</h2>
      <p class="bcb-text">${T(
        `Solo guardamos en tu navegador lo necesario para que la página funcione y recuerde tu idioma. No usamos cookies de publicidad ni de seguimiento. <a href="${policyHref}" data-legal="cookies">Política de cookies</a>`,
        `We only store what this page needs to work and remember your language. No advertising or tracking cookies. <a href="${policyHref}" data-legal="cookies">Cookie policy</a>`
      )}</p>
    </div>
    <div class="bcb-actions">
      <button type="button" class="bcb-link" data-bcb="settings">${T('Configurar', 'Customize')}</button>
      <button type="button" class="bcb-btn bcb-btn--secondary" data-bcb="reject">${T('Solo necesarias', 'Necessary only')}</button>
      <button type="button" class="bcb-btn bcb-btn--primary" data-bcb="accept">${T('Aceptar todo', 'Accept all')}</button>
    </div>
  </div>
</section>`;

  const DIALOG = `
<dialog class="bcb-dialog" aria-labelledby="bcb-dlg-title">
  <div class="bcb-dlg">
    <div class="bcb-dlg-head">
      <h2 id="bcb-dlg-title">${T('Preferencias de cookies', 'Cookie settings')}</h2>
      <button type="button" class="bcb-close" data-bcb="close" data-label-es="Cerrar" data-label-en="Close">
        <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
    <p class="bcb-intro">${T(
      `Elige qué nos permites guardar en tu dispositivo. Puedes cambiarlo cuando quieras desde «Preferencias de cookies», al pie de la página. Más detalles en la <a href="${privacyHref}" data-legal="privacidad">Política de privacidad</a>.`,
      `Choose what we may store on your device. You can change it any time from “Cookie settings” at the bottom of the page. More details in our <a href="${privacyHref}" data-legal="privacidad">Privacy policy</a>.`
    )}</p>
    <ul class="bcb-cats">
      <li class="bcb-cat">
        <div class="bcb-cat-head">
          <span class="bcb-cat-name">${T('Necesarias', 'Necessary')}</span>
          <span class="bcb-always">${T('Siempre activas', 'Always on')}</span>
        </div>
        <p>${T(
          'Recuerdan tu idioma y esta misma elección. Sin ellas la página no funciona bien, y no sirven para identificarte.',
          'They remember your language and this choice. The page doesn’t work properly without them, and they can’t identify you.'
        )}</p>
      </li>
      <li class="bcb-cat">
        <label class="bcb-cat-head" for="bcb-analytics">
          <span class="bcb-cat-name">${T('Analítica', 'Analytics')}</span>
          <input type="checkbox" role="switch" class="bcb-switch" id="bcb-analytics" data-cat="analytics" aria-describedby="bcb-analytics-desc">
        </label>
        <p id="bcb-analytics-desc">${T(
          'Nos ayudaría a saber cuántas personas visitan la página, de forma agregada. Hoy no usamos ninguna herramienta de analítica: si la añadimos, la nombraremos en la Política de cookies y solo se activará con tu permiso.',
          'It would help us count visits in aggregate. We don’t use any analytics tool today: if we add one, we’ll name it in the Cookie policy and it will only run with your permission.'
        )}</p>
      </li>
      <li class="bcb-cat">
        <label class="bcb-cat-head" for="bcb-marketing">
          <span class="bcb-cat-name">${T('Marketing', 'Marketing')}</span>
          <input type="checkbox" role="switch" class="bcb-switch" id="bcb-marketing" data-cat="marketing" aria-describedby="bcb-marketing-desc">
        </label>
        <p id="bcb-marketing-desc">${T(
          'Permitiría medir campañas en redes sociales. Hoy no usamos ninguna herramienta de este tipo: si la añadimos, solo se activará con tu permiso.',
          'It would let us measure social media campaigns. We don’t use any such tool today: if we add one, it will only run with your permission.'
        )}</p>
      </li>
    </ul>
    <div class="bcb-dlg-actions">
      <button type="button" class="bcb-btn bcb-btn--secondary" data-bcb="reject">${T('Solo necesarias', 'Necessary only')}</button>
      <button type="button" class="bcb-btn bcb-btn--ghost" data-bcb="save">${T('Guardar selección', 'Save choices')}</button>
      <button type="button" class="bcb-btn bcb-btn--primary" data-bcb="accept">${T('Aceptar todo', 'Accept all')}</button>
    </div>
  </div>
</dialog>`;

  let banner, dialog, opener = null;

  function syncLabels() {
    const en = document.documentElement.lang === 'en';
    document.querySelectorAll('.bcb [data-label-es], .bcb-dialog [data-label-es]').forEach(el => {
      el.setAttribute('aria-label', en ? el.dataset.labelEn : el.dataset.labelEs);
    });
    if (banner) banner.setAttribute('aria-label', en ? 'Cookie notice' : 'Aviso de cookies');
  }

  function showBanner() {
    banner.hidden = false;
    // Forzar el cálculo de estilos antes de añadir la clase dispara la
    // transición sin depender de requestAnimationFrame, que se pausa en
    // pestañas en segundo plano (el banner quedaría invisible).
    void banner.offsetWidth;
    banner.classList.add('is-in');
  }

  function hideBanner() {
    if (banner.hidden) return;
    const hadFocus = banner.contains(document.activeElement);
    banner.classList.remove('is-in');
    const done = () => { banner.hidden = true; };
    if (REDUCED) done(); else setTimeout(done, 450);
    if (hadFocus) {
      const main = document.getElementById('main') || document.getElementById('contenido');
      if (main) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
    }
  }

  function save(choice) {
    current = { v: VERSION, ts: Date.now(), necessary: true, analytics: !!choice.analytics, marketing: !!choice.marketing };
    write(current);
    hideBanner();
    if (dialog.open) dialog.close();
    document.dispatchEvent(new CustomEvent('biinyu:consent', { detail: current }));
  }

  function openSettings(from) {
    opener = from || document.activeElement;
    dialog.querySelectorAll('[data-cat]').forEach(input => {
      input.checked = !!(current && current[input.dataset.cat]);
    });
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function choiceFromSwitches() {
    const out = {};
    dialog.querySelectorAll('[data-cat]').forEach(input => { out[input.dataset.cat] = input.checked; });
    return out;
  }

  function onAction(action) {
    if (action === 'accept') save({ analytics: true, marketing: true });
    else if (action === 'reject') save({ analytics: false, marketing: false });
    else if (action === 'save') save(choiceFromSwitches());
    else if (action === 'settings') openSettings(document.activeElement);
    else if (action === 'close') dialog.close();
  }

  function mount() {
    const style = document.createElement('style');
    style.id = 'bcb-style';
    style.textContent = CSS;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.innerHTML = BANNER + DIALOG;
    banner = wrap.querySelector('.bcb');
    dialog = wrap.querySelector('.bcb-dialog');
    document.body.appendChild(banner);
    document.body.appendChild(dialog);

    banner.addEventListener('click', e => {
      const b = e.target.closest('[data-bcb]');
      if (b) onAction(b.dataset.bcb);
    });
    dialog.addEventListener('click', e => {
      if (e.target === dialog) { dialog.close(); return; }
      const b = e.target.closest('[data-bcb]');
      if (b) onAction(b.dataset.bcb);
    });
    dialog.addEventListener('close', () => {
      const target = opener && document.contains(opener) && !banner.contains(opener) ? opener : null;
      if (target && typeof target.focus === 'function') target.focus({ preventScroll: true });
      else if (!banner.hidden) { const first = banner.querySelector('[data-bcb="accept"]'); if (first) first.focus({ preventScroll: true }); }
      opener = null;
    });

    document.addEventListener('click', e => {
      const t = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (!t) return;
      e.preventDefault();
      openSettings(t);
    });

    new MutationObserver(syncLabels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    syncLabels();

    if (!current) showBanner();
    else document.dispatchEvent(new CustomEvent('biinyu:consent', { detail: current }));
  }

  window.BiinyuConsent = {
    get: () => current,
    has: category => category === 'necessary' || !!(current && current[category]),
    open: () => openSettings(document.activeElement),
    reset: () => {
      current = null;
      try { localStorage.removeItem(KEY); } catch (e) {}
      if (banner) showBanner();
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
