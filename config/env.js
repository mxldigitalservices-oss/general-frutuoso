require('dotenv').config();
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const isProd = process.env.NODE_ENV === 'production';
const flag = (v, def) => (v === undefined || v === '' ? def : v === 'true');

const env = {
  ROOT,
  isProd,
  BUILD: String(Date.now()),
  PORT: parseInt(process.env.PORT, 10) || 8080,
  // Dominio oficial: cuando lo tengas, solo cambia estas dos variables en Railway.
  SITE_URL: (process.env.SITE_URL || '').replace(/\/+$/, ''),
  CANONICAL_HOST: (process.env.CANONICAL_HOST || '').toLowerCase().trim(),
  PUBLIC_URL: '',
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

// Base de los enlaces enviados por correo. Nunca se toma del encabezado Host (se puede falsificar).
env.PUBLIC_URL = env.SITE_URL
  || (env.CANONICAL_HOST ? `https://${env.CANONICAL_HOST}` : '')
  || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '');

if (!env.SESSION_SECRET) {
  if (isProd) throw new Error('SESSION_SECRET es obligatorio en producción');
  env.SESSION_SECRET = 'solo-desarrollo-' + crypto.randomBytes(16).toString('hex');
} else if (isProd && env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET debe tener al menos 32 caracteres en producción');
}

module.exports = env;
