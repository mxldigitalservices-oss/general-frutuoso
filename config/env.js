require('dotenv').config();
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const isProd = process.env.NODE_ENV === 'production';
const flag = (v, def) => (v === undefined || v === '' ? def : v === 'true');

// Dominio oficial de producción. Es el respaldo cuando PUBLIC_URL / CANONICAL_HOST no están definidas,
// para no depender nunca de la dirección *.up.railway.app.
const DOMINIO_OFICIAL = 'juanmanuelfructuosoheredia.com';

const limpiarHost = (v) => String(v || '').trim().toLowerCase()
  .replace(/^[a-z]+:\/\//, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '');

// Devuelve solo el origen (https://dominio) de una URL; vacío si no es válida.
function origen(v) {
  let s = String(v || '').trim().replace(/\/+$/, '');
  if (!s) return '';
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try { return new URL(s).origin; } catch (e) { return ''; }
}

// PUBLIC_URL es la variable oficial (SITE_URL se acepta como nombre anterior).
const publicUrlDeclarada = origen(process.env.PUBLIC_URL || process.env.SITE_URL);

let canonicalHost = limpiarHost(process.env.CANONICAL_HOST);
if (!canonicalHost && isProd) {
  canonicalHost = publicUrlDeclarada ? new URL(publicUrlDeclarada).hostname : DOMINIO_OFICIAL;
}

// Base de los enlaces enviados por correo y del sitemap/canonical. Nunca se toma del encabezado Host (se puede falsificar).
const publicUrl = publicUrlDeclarada || (canonicalHost ? `https://${canonicalHost}` : '');

const proxies = parseInt(process.env.TRUST_PROXY, 10);

const env = {
  ROOT,
  isProd,
  BUILD: String(Date.now()),
  PORT: parseInt(process.env.PORT, 10) || 8080,
  DOMINIO_OFICIAL,
  PUBLIC_URL: publicUrl,
  SITE_URL: publicUrl, // compatibilidad con el nombre anterior
  CANONICAL_HOST: canonicalHost,
  // Cantidad de proxies delante de la app (Railway termina HTTPS en 1).
  TRUST_PROXY: Number.isFinite(proxies) && proxies >= 0 ? proxies : 1,
  SESSION_SECRET: process.env.SESSION_SECRET || '',
  COOKIE_SECURE: flag(process.env.COOKIE_SECURE, isProd),
  SETUP_TOKEN: process.env.SETUP_TOKEN || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  PG_SSL: flag(process.env.PG_SSL, false),
  MONGO_URL: process.env.MONGO_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  GMAIL_USER: process.env.GMAIL_USER || '',
  GMAIL_PASS: process.env.GMAIL_PASS || '',
  CONTACT_TO: process.env.CONTACT_TO || process.env.GMAIL_USER || '',
  WHATSAPP: (process.env.WHATSAPP || '18093041128').replace(/\D/g, ''),
  STRICT_BOOT: flag(process.env.STRICT_BOOT, isProd)
};

if (env.PUBLIC_URL && env.CANONICAL_HOST && new URL(env.PUBLIC_URL).hostname !== env.CANONICAL_HOST) {
  console.warn(`⚠ PUBLIC_URL (${env.PUBLIC_URL}) y CANONICAL_HOST (${env.CANONICAL_HOST}) no coinciden: los enlaces de correo y el redirect apuntarán a sitios distintos.`);
}
if (isProd && !env.COOKIE_SECURE) {
  console.warn('⚠ COOKIE_SECURE=false en producción: la cookie de sesión del panel viajará sin la marca Secure.');
}

if (!env.SESSION_SECRET) {
  if (isProd) throw new Error('SESSION_SECRET es obligatorio en producción');
  env.SESSION_SECRET = 'solo-desarrollo-' + crypto.randomBytes(16).toString('hex');
} else if (isProd && env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET debe tener al menos 32 caracteres en producción');
}

module.exports = env;
