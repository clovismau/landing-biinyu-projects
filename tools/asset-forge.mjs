// asset-forge.mjs — servidor local temporal para extraer assets de la maqueta.
// Sirve el SVG original + los PNG de capas desde un solo origen (sin CORS),
// y acepta POST /save para escribir los resultados a disco.
// Uso: node tools/asset-forge.mjs   → http://localhost:8890/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const SVG_SRC = 'C:/Users/CLOVIS CASTRO/Desktop/landing-coming-soon.svg';

const MIME = {
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.html': 'text/html', '.json': 'application/json',
};

const HARNESS = `<!doctype html><html><head><meta charset="utf-8"><title>asset forge</title></head>
<body style="margin:0;background:#111;color:#9DE228;font:13px monospace">
<div id="log">listo</div>
<script>
window.__log = m => { document.getElementById('log').textContent = m; };

// Convierte un PNG servido localmente a WebP con la calidad indicada.
window.toWebp = async function(name, quality, maxW){
  const resp = await fetch('/file/' + name);
  const blob = await resp.blob();
  let bmp = await createImageBitmap(blob);
  let w = bmp.width, h = bmp.height;
  if (maxW && w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(bmp, 0, 0, w, h);
  const dataUrl = c.toDataURL('image/webp', quality);
  const out = name.replace(/\\.png$/, '.webp');
  const r = await fetch('/save', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ filename: out, dataUrl })
  });
  const j = await r.json();
  return { out, w, h, kb: Math.round(j.bytes/1024) };
};

// Carga el SVG de la maqueta en un contenedor oculto para medir con getBBox().
window.loadMockup = async function(){
  const txt = await (await fetch('/mockup.svg')).text();
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-99999px;top:0;width:1440px;height:2054px';
  host.innerHTML = txt;
  document.body.appendChild(host);
  window.__svg = host.querySelector('svg');
  return { ok: true, w: window.__svg.getAttribute('width'), h: window.__svg.getAttribute('height') };
};

// Devuelve el bounding box real de un elemento localizado por prefijo de path.
window.bboxOf = function(prefix){
  const el = [...window.__svg.querySelectorAll('path,g,rect')]
    .find(e => (e.getAttribute('d')||'').startsWith(prefix));
  if(!el) return null;
  const b = el.getBBox();
  return { x:b.x, y:b.y, w:b.width, h:b.height };
};
</script>
</body></html>`;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HARNESS);
    return;
  }

  if (req.method === 'GET' && req.url === '/mockup.svg') {
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    fs.createReadStream(SVG_SRC).pipe(res);
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/file/')) {
    const rel = decodeURIComponent(req.url.slice('/file/'.length));
    const fp = path.resolve(root, 'assets', 'parallax', rel);
    if (!fs.existsSync(fp)) { res.writeHead(404); res.end('missing ' + fp); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(res);
    return;
  }

  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { filename, dataUrl, text } = JSON.parse(body);
        const fp = path.resolve(root, 'assets', 'parallax', filename);
        fs.mkdirSync(path.dirname(fp), { recursive: true });
        let bytes;
        if (text != null) { fs.writeFileSync(fp, text, 'utf8'); bytes = Buffer.byteLength(text); }
        else { const buf = Buffer.from(dataUrl.split(',')[1], 'base64'); fs.writeFileSync(fp, buf); bytes = buf.length; }
        console.log('saved', fp, bytes);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, bytes }));
      } catch (e) {
        console.error(e);
        res.writeHead(500); res.end(String(e));
      }
    });
    return;
  }

  res.writeHead(404); res.end('not found');
});

server.listen(8890, () => console.log('asset-forge on http://localhost:8890/  root=' + root));
