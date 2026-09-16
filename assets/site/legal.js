/* Páginas legales y 404: selector de idioma (compartido con la landing
   mediante localStorage "biinyu_lang") y año del pie. */
(function () {
  'use strict';
  const root = document.documentElement;

  function setLang(lang) {
    root.lang = lang;
    document.querySelectorAll('[data-lang-btn]').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.langBtn === lang));
    });
    const title = root.getAttribute('data-title-' + lang);
    if (title) document.title = title;
    try { localStorage.setItem('biinyu_lang', lang); } catch (e) {}
  }

  document.querySelectorAll('[data-lang-btn]').forEach(b => {
    b.addEventListener('click', () => setLang(b.dataset.langBtn));
  });
  setLang(root.lang === 'en' ? 'en' : 'es');

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();
