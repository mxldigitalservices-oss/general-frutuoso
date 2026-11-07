const { ajustes: DEFAULTS } = require('../config/defaults');

const HEX = /^#[0-9a-f]{6}$/i;

const SERIF = (n) => `'${n}', Georgia, 'Times New Roman', serif`;
const SANS = (n) => `'${n}', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;

const FUENTES = [
  { id: 'playfair', nombre: 'Playfair Display', familia: SERIF('Playfair Display'), gf: 'Playfair+Display:wght@400;600;700' },
  { id: 'cormorant', nombre: 'Cormorant Garamond', familia: SERIF('Cormorant Garamond'), gf: 'Cormorant+Garamond:wght@400;600;700' },
  { id: 'eb-garamond', nombre: 'EB Garamond', familia: SERIF('EB Garamond'), gf: 'EB+Garamond:wght@400;600;700' },
  { id: 'libre-baskerville', nombre: 'Libre Baskerville', familia: SERIF('Libre Baskerville'), gf: 'Libre+Baskerville:wght@400;700' },
  { id: 'lora', nombre: 'Lora', familia: SERIF('Lora'), gf: 'Lora:wght@400;600;700' },
  { id: 'merriweather', nombre: 'Merriweather', familia: SERIF('Merriweather'), gf: 'Merriweather:wght@400;700' },
  { id: 'cinzel', nombre: 'Cinzel', familia: SERIF('Cinzel'), gf: 'Cinzel:wght@500;700' },
  { id: 'montserrat', nombre: 'Montserrat', familia: SANS('Montserrat'), gf: 'Montserrat:wght@400;600;700' },
  { id: 'inter', nombre: 'Inter', familia: SANS('Inter'), gf: 'Inter:wght@400;600;700' },
  { id: 'source-sans', nombre: 'Source Sans 3', familia: SANS('Source Sans 3'), gf: 'Source+Sans+3:wght@400;600;700' },
  { id: 'sistema', nombre: 'Sistema (sin descarga, más rápida)', familia: "Georgia, 'Times New Roman', serif", gf: null }
];

const PALETAS = [
  { id: 'institucional', nombre: 'Institucional oscuro', fondo: '#0b0e14', superficie: '#151b28', texto: '#f3ecd8', acento: '#c9a84c' },
  { id: 'azul-naval', nombre: 'Azul naval', fondo: '#0a1220', superficie: '#121d33', texto: '#eef0f5', acento: '#d4b25f' },
  { id: 'verde-militar', nombre: 'Verde militar', fondo: '#0d130f', superficie: '#16201a', texto: '#ece8d6', acento: '#b8a24a' },
  { id: 'bordo', nombre: 'Borgoña', fondo: '#160b0e', superficie: '#241319', texto: '#f1e6dc', acento: '#c9a14a' },
  { id: 'marfil', nombre: 'Marfil claro', fondo: '#f6f1e4', superficie: '#ffffff', texto: '#1b1f2a', acento: '#8a6d1f' }
];

const porId = Object.fromEntries(FUENTES.map((f) => [f.id, f]));

function urlFuentes(ids) {
  const familias = [...new Set(ids)].map((id) => porId[id]).filter((f) => f && f.gf).map((f) => 'family=' + f.gf);
  return familias.length ? 'https://fonts.googleapis.com/css2?' + familias.join('&') + '&display=swap' : '';
}

function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a, b) {
  const la = luminancia(a); const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const textoSobre = (hex) => (contraste(hex, '#101010') >= contraste(hex, '#ffffff') ? '#101010' : '#ffffff');

// Evita que un tema ilegible (texto sobre fondo casi igual) llegue al sitio.
function validarTema(t) {
  const errores = [];
  if (contraste(t.texto, t.fondo) < 4.5) errores.push('El color del texto y el del fondo se parecen demasiado (poco contraste).');
  if (contraste(t.texto, t.superficie) < 4.5) errores.push('El color del texto y el de las tarjetas se parecen demasiado (poco contraste).');
  if (contraste(t.acento, t.fondo) < 3) errores.push('El color de acento casi no se distingue del fondo.');
  return errores;
}

// Bloque <style> con las variables del tema. Solo usa valores validados.
function cssTema(aj) {
  const hex = (v, def) => (typeof v === 'string' && HEX.test(v) ? v : def);
  const d = DEFAULTS.tema;
  const t = {
    fondo: hex(aj.tema.fondo, d.fondo), superficie: hex(aj.tema.superficie, d.superficie),
    texto: hex(aj.tema.texto, d.texto), acento: hex(aj.tema.acento, d.acento)
  };
  const marco = hex(aj.cubrefalta.colorMarco, t.acento);
  const ft = porId[aj.tipografia.titulos] || porId[DEFAULTS.tipografia.titulos];
  const fc = porId[aj.tipografia.cuerpo] || porId[DEFAULTS.tipografia.cuerpo];
  return `:root{--bg:${t.fondo};--surface:${t.superficie};--text:${t.texto};--accent:${t.acento};--on-accent:${textoSobre(t.acento)};--cf-marco:${marco};--font-titulos:${ft.familia};--font-cuerpo:${fc.familia}}`;
}

module.exports = { FUENTES, PALETAS, HEX, porId, urlFuentes, cssTema, validarTema, contraste };
