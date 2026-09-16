// build-artifact.mjs
//
// Genera dos versiones de index.html listas para publicarse como Artifact:
//   dist/artifact-public.html  → sin capacidad db, formulario en modo demo,
//                                 compartible públicamente.
//   dist/artifact-db.html      → capacidad db, lista de espera funcional,
//                                 restringido a la organización del dueño.
//
// index.html sigue siendo la fuente de verdad para hosting propio: este
// script solo lo transforma, nunca lo edita.
//
// Transformaciones:
//   1. Quita <!doctype>, <html>, <head>…</head> y las etiquetas de cierre
//      </body></html> — los Artifacts no llevan ese scaffolding.
//   2. Conserva <title> y usa Google Fonts: la CSP de los Artifacts solo
//      admite fuentes de ahí, así que el bloque FONTS (tipografías alojadas
//      en el propio servidor) se quita del CSS.
//   3. Inserta el <style> del <head> al inicio del cuerpo.
//   4. Incrusta los scripts compartidos (assets/site/*.js, p. ej. el banner
//      de cookies) dentro de <script>.
//   5. Los Artifacts son una sola página: las políticas (privacidad,
//      términos, cookies) se incrustan como <dialog> y los enlaces con
//      data-legal los abren en vez de navegar.
//   6. Incrusta cada asset local (assets/*.png, *.svg, *.mp4…) como data: URI,
//      porque la CSP de los Artifacts bloquea imágenes externas.
//   7. Reescribe el bloque WAITLIST:CONFIG con el modo correspondiente.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const MIME = {
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
};
// límite conservador para el peso final del Artifact (16 MB reales)
const ARTIFACT_BUDGET_BYTES = 15 * 1024 * 1024;

const GOOGLE_FONTS = '<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,700&display=swap" rel="stylesheet">';

const LEGAL_PAGES = [
  { id: 'privacidad', file: 'privacidad.html', label: 'Política de privacidad / Privacy policy' },
  { id: 'terminos', file: 'terminos.html', label: 'Términos y condiciones / Terms of use' },
  { id: 'cookies', file: 'cookies.html', label: 'Política de cookies / Cookie policy' },
];

function toDataUri(relPath) {
  const filePath = path.join(root, relPath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext];
  if (!mime) throw new Error(`Tipo de asset no soportado: ${relPath}`);
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function inlineAssets(html) {
  // src="assets/…", poster="assets/…" y url(assets/…). El enlace del
  // WALLPAPER usa a propósito "./assets/…", que no calza este patrón.
  return html.replace(/(["'(])(assets\/[a-zA-Z0-9/_-]+\.(?:png|webp|jpg|jpeg|svg|mp4))(["')])/g,
    (_, open, rel, close) => `${open}${toDataUri(rel)}${close}`);
}

function extractBetween(src, startTag, endTag) {
  const start = src.indexOf(startTag);
  const end = src.indexOf(endTag, start + startTag.length);
  if (start === -1 || end === -1) throw new Error(`No se encontró ${startTag} / ${endTag}`);
  return src.slice(start + startTag.length, end);
}

function buildArtifactBody(sourceHtml) {
  const titleMatch = sourceHtml.match(/<title>([\s\S]*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : 'Biinyu Studio — OYYO';
  const style = extractBetween(sourceHtml, '<style>', '</style>')
    .replace(/\/\* FONTS:START \*\/[\s\S]*?\/\* FONTS:END \*\//, '');
  const bodyInner = extractBetween(sourceHtml, '<body>', '</body>');
  return `<title>${title}</title>\n${GOOGLE_FONTS}\n<style>${style}</style>\n${bodyInner}`;
}

function inlineScripts(html) {
  return html.replace(/<script src="(assets\/site\/[a-z0-9-]+\.js)"(?: defer)?><\/script>/g, (_, rel) => {
    const code = fs.readFileSync(path.join(root, rel), 'utf8');
    if (code.includes('</script')) throw new Error(`${rel} contiene "</script" y no se puede incrustar`);
    return `<script>\n${code}\n</script>`;
  });
}

function buildLegalDialogs() {
  const css = fs.readFileSync(path.join(root, 'assets/site/legal.css'), 'utf8');
  const dialogs = LEGAL_PAGES.map(({ id, file, label }) => {
    const src = fs.readFileSync(path.join(root, file), 'utf8');
    const doc = extractBetween(src, '<!-- LEGAL:START -->', '<!-- LEGAL:END -->').trim();
    return `<dialog class="legal-dialog" id="legal-${id}" aria-label="${label}">\n` +
      `<div class="legal-dialog-bar"><button type="button" class="legal-dialog-close" data-legal-close aria-label="Cerrar / Close">×</button></div>\n` +
      `${doc}\n</dialog>`;
  }).join('\n');
  const js = `<script>
(function () {
  document.addEventListener('click', function (e) {
    var t = e.target;
    var link = t.closest && t.closest('a[data-legal]');
    if (link) {
      var d = document.getElementById('legal-' + link.getAttribute('data-legal'));
      if (!d || typeof d.showModal !== 'function') return;
      e.preventDefault();
      document.querySelectorAll('dialog.legal-dialog[open]').forEach(function (o) { if (o !== d) o.close(); });
      if (!d.open) d.showModal();
      d.scrollTop = 0;
      return;
    }
    var close = t.closest && t.closest('[data-legal-close]');
    if (close) { close.closest('dialog').close(); return; }
    if (t.matches && t.matches('dialog.legal-dialog')) t.close();
  });
})();
</script>`;
  return `<style>${css}</style>\n${dialogs}\n${js}`;
}

function setWaitlistMode(html, mode) {
  return html.replace(
    /\/\* WAITLIST:CONFIG:START \*\/[\s\S]*?\/\* WAITLIST:CONFIG:END \*\//,
    `/* WAITLIST:CONFIG:START */\nconst WAITLIST_ENDPOINT = '';\nconst WAITLIST_MODE = '${mode}';\n/* WAITLIST:CONFIG:END */`
  );
}

function main() {
  const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  let artifactBody = buildArtifactBody(source);
  artifactBody = inlineScripts(artifactBody);
  artifactBody += '\n' + buildLegalDialogs();
  artifactBody = inlineAssets(artifactBody);

  const distDir = path.join(root, 'dist');
  fs.mkdirSync(distDir, { recursive: true });

  const publicHtml = setWaitlistMode(artifactBody, 'demo');
  fs.writeFileSync(path.join(distDir, 'artifact-public.html'), publicHtml, 'utf8');

  const dbHtml = setWaitlistMode(artifactBody, 'db');
  fs.writeFileSync(path.join(distDir, 'artifact-db.html'), dbHtml, 'utf8');

  const pubBytes = Buffer.byteLength(publicHtml, 'utf8');
  const dbBytes = Buffer.byteLength(dbHtml, 'utf8');
  console.log(`dist/artifact-public.html — ${Math.round(pubBytes / 1024)} KB`);
  console.log(`dist/artifact-db.html     — ${Math.round(dbBytes / 1024)} KB`);
  for (const [name, bytes] of [['artifact-public.html', pubBytes], ['artifact-db.html', dbBytes]]) {
    if (bytes > ARTIFACT_BUDGET_BYTES) {
      console.warn(`⚠ ${name} pesa ${(bytes / 1024 / 1024).toFixed(2)} MB, cerca o por encima del límite de 16 MB de los Artifacts.`);
    }
  }
}

main();
