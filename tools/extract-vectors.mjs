// Regenera los SVG vectoriales de la maqueta con viewBox correcto.
import fs from 'node:fs';
const SRC = 'C:/Users/CLOVIS CASTRO/Desktop/landing-coming-soon.svg';
const src = fs.readFileSync(SRC, 'utf8');
const lines = src.split('\n');

// defs sin patterns/images (esos pesan los 10MB)
let defs = src.slice(src.indexOf('<defs>'), src.lastIndexOf('</defs>') + 7);
defs = defs.replace(/<pattern[\s\S]*?<\/pattern>/g, '').replace(/<image[^>]*\/>/g, '');

// mapa de TODOS los filtros -> bounds (filterUnits="userSpaceOnUse")
const filters = {};
const fre = /<filter id="([^"]+)"[^>]*?x="([-\d.]+)"[^>]*?y="([-\d.]+)"[^>]*?width="([-\d.]+)"[^>]*?height="([-\d.]+)"/g;
let fm;
while ((fm = fre.exec(src))) {
  filters[fm[1]] = { x: +fm[2], y: +fm[3], w: +fm[4], h: +fm[5] };
}

function pathBBox(d) {
  const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  let x = 0, y = 0, cmd = '', minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9, i = 0;
  const put = (px, py) => { if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py; };
  const num = () => parseFloat(toks[i++]);
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) { cmd = toks[i]; i++; }
    const rel = cmd === cmd.toLowerCase(); const C = cmd.toUpperCase();
    if (C === 'M' || C === 'L' || C === 'T') { const a = num(), b = num(); x = rel ? x + a : a; y = rel ? y + b : b; put(x, y); }
    else if (C === 'H') { const a = num(); x = rel ? x + a : a; put(x, y); }
    else if (C === 'V') { const a = num(); y = rel ? y + a : a; put(x, y); }
    else if (C === 'C') { const a=num(),b=num(),c=num(),e=num(),f=num(),g=num();
      put(rel?x+a:a, rel?y+b:b); put(rel?x+c:c, rel?y+e:e);
      const nx=rel?x+f:f, ny=rel?y+g:g; x=nx; y=ny; put(x,y); }
    else if (C === 'S' || C === 'Q') { const a=num(),b=num(),c=num(),e=num();
      put(rel?x+a:a, rel?y+b:b); const nx=rel?x+c:c, ny=rel?y+e:e; x=nx; y=ny; put(x,y); }
    else if (C === 'A') { num();num();num();num();num(); const e=num(),f=num();
      const nx=rel?x+e:e, ny=rel?y+f:f; x=nx; y=ny; put(x,y); }
    else if (C === 'Z') { /* noop */ }
    else { i++; }
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function unionOf(body) {
  let U = { x: 1e9, y: 1e9, X: -1e9, Y: -1e9 };
  const add = (b) => { U.x = Math.min(U.x, b.x); U.y = Math.min(U.y, b.y); U.X = Math.max(U.X, b.x + b.w); U.Y = Math.max(U.Y, b.y + b.h); };
  for (const m of body.matchAll(/url\(#(filter[^)]+)\)/g)) if (filters[m[1]]) add(filters[m[1]]);
  for (const m of body.matchAll(/ d="([^"]+)"/g)) { const b = pathBBox(m[1]); if (b.w > 0 && b.h > 0) add(b); }
  return { x: U.x, y: U.y, w: U.X - U.x, h: U.Y - U.y };
}

function wrap(body, b, pad) {
  const x = (b.x - pad).toFixed(2), y = (b.y - pad).toFixed(2);
  const w = (b.w + pad * 2).toFixed(2), h = (b.h + pad * 2).toFixed(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}" fill="none">\n${defs}\n${body}\n</svg>\n`;
}

// 1) TITULO (lineas 6..79)
let titleBody = lines.slice(5, 79).join('\n');
const opens = (titleBody.match(/<g[\s>]/g) || []).length;
const closes = (titleBody.match(/<\/g>/g) || []).length;
titleBody += '</g>'.repeat(Math.max(0, opens - closes));
const T = unionOf(titleBody);

// 2) OYYO wordmark
const oi = src.indexOf('<path d="M97.44 1661.48');
const oyyoEl = src.slice(oi, src.indexOf('/>', oi) + 2);
const O = pathBBox(oyyoEl.match(/ d="([^"]+)"/)[1]);

// 3) Logo lockup (bounds exactos de Figma: Group 90)
const logoBody = src.slice(src.indexOf('<path d="M90.7771 65.3885'), src.indexOf('<rect x="1302" y="40"'));
const L = { x: 40, y: 40, w: 138.06, h: 51.25 };

fs.mkdirSync('assets/vector', { recursive: true });
fs.writeFileSync('assets/vector/titulo.svg', wrap(titleBody, T, 6));
fs.writeFileSync('assets/vector/oyyo.svg', wrap(oyyoEl, O, 2));
fs.writeFileSync('assets/vector/logo.svg', wrap(logoBody, L, 1));

const kb = f => Math.round(fs.statSync(f).size / 1024) + 'KB';
const vb = f => fs.readFileSync(f, 'utf8').match(/viewBox="([^"]+)"/)[1];
console.log(JSON.stringify({
  filtrosEncontrados: Object.keys(filters).length,
  titulo: { viewBox: vb('assets/vector/titulo.svg'), size: kb('assets/vector/titulo.svg') },
  oyyo:   { viewBox: vb('assets/vector/oyyo.svg'),   size: kb('assets/vector/oyyo.svg') },
  logo:   { viewBox: vb('assets/vector/logo.svg'),   size: kb('assets/vector/logo.svg') },
}, null, 1));
