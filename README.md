# Biinyu Studio — OYYO

Landing de lanzamiento de OYYO para Biinyu Studio ("10 años farmeando XP"):
hero con parallax, sección de OYYO con video y zoom ligado al scroll, lista
de espera, banner de cookies, políticas legales y página 404. Bilingüe
(español / inglés).

## Archivos

```
index.html            ← la landing. Fuente de verdad: se edita a mano.
privacidad.html       ← Política de privacidad y tratamiento de datos (Ley 1581 de 2012 / RGPD)
terminos.html         ← Términos y condiciones de uso
cookies.html          ← Política de cookies
404.html              ← página de error (usa rutas desde la raíz: /assets/…)
assets/
  fonts/              tipografías Poppins y Baloo 2 alojadas aquí (sin Google Fonts)
  site/
    consent.js        banner y panel de preferencias de cookies (todas las páginas)
    legal.css         estilos de las páginas legales y la 404
    legal.js          idioma y año en las páginas legales y la 404
    fonts.css         @font-face para las páginas legales y la 404
  vector/             logo, favicon, título y wordmarks (SVG originales)
  parallax/           capas del hero y artes de las secciones
  video/              video de la sección OYYO
tools/
  build-artifact.mjs  genera dist/ a partir de index.html y las páginas legales
  static-server.mjs   servidor local (con 404 real y video por partes)
dist/                 builds generados para Artifact — no editar a mano
```

## Pendiente antes de publicar

1. **Datos del estudio.** En las páginas legales, la 404 y el pie de la
   landing hay textos resaltados en amarillo (`<mark class="todo" data-todo="…">`).
   Busca `data-todo` y reemplaza: razón social, NIT, dirección, correo de
   contacto, teléfono, proveedor de hosting y proveedor de correo.
2. **Lista de espera real.** En `index.html`, busca `WAITLIST:CONFIG:START`
   y pega el endpoint de tu proveedor (Formspree, Brevo, Mailchimp…) en
   `WAITLIST_ENDPOINT`. Sin endpoint, el formulario avisa que es una vista
   previa y no guarda nada. Cada registro envía `email`, `consent`,
   `consentVersion`, `lang` y `ts` (prueba de la autorización).
3. **Redes.** Confirma que los enlaces de Facebook y LinkedIn del pie son
   los perfiles correctos y agrega los que falten.
4. **Vista previa al compartir.** Cuando tengas dominio, agrega en el
   `<head>` de `index.html` `og:url` y `og:image` con URL absoluta.

## Hosting

- Sube todo el contenido de la carpeta (menos `dist/` y `tools/`) a la raíz
  del dominio, con HTTPS.
- **Página 404:** Netlify, Vercel, Cloudflare Pages y GitHub Pages usan
  `404.html` automáticamente. En Apache agrega a `.htaccess`:
  `ErrorDocument 404 /404.html`. En Nginx: `error_page 404 /404.html;`.
- Si publicas en una subcarpeta (no en la raíz), cambia las rutas
  `/assets/…` y `/…` de `404.html`.

## Cookies y consentimiento

Hoy la página solo guarda en el navegador lo necesario: `biinyu_lang`
(idioma) y `biinyu_consent` (tu elección, 12 meses). Si algún día añades
analítica o píxeles:

1. Nómbralos en la tabla de `cookies.html`.
2. Sube `VERSION` en `assets/site/consent.js` para volver a preguntar.
3. Cárgalos solo con permiso:

```js
if (window.BiinyuConsent && BiinyuConsent.has('analytics')) { /* cargar */ }
document.addEventListener('biinyu:consent', e => { if (e.detail.analytics) { /* cargar */ } });
```

Cualquier elemento con `data-cookie-settings` abre el panel de preferencias.

## Previsualizar en local

```bash
node tools/static-server.mjs
```

Abre `http://localhost:4173`. Cualquier ruta inexistente muestra la 404.

## Builds de Artifact

```bash
node tools/build-artifact.mjs
```

Genera `dist/artifact-public.html` (formulario en modo demo, compartible)
y `dist/artifact-db.html` (lista de espera real con la capacidad `db`,
restringido a tu organización). En los Artifacts las fuentes vienen de
Google Fonts (la plataforma solo permite esa fuente), los assets van
incrustados y las políticas se abren como ventanas dentro de la página.
