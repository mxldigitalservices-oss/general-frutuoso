const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const env = require('./env');

let pool = null;

function getPool() {
  if (!pool) {
    if (!env.DATABASE_URL) throw new Error('DATABASE_URL no está definida');
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.PG_SSL ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
    pool.on('error', (e) => console.error('PostgreSQL (pool):', e.message));
  }
  return pool;
}

const query = (text, params) => getPool().query(text, params);

async function init() {
  const sql = fs.readFileSync(path.join(env.ROOT, 'db', 'schema.sql'), 'utf8');
  await query(sql);
  console.log('✔ PostgreSQL listo');
}

async function close() {
  if (pool) await pool.end();
}

module.exports = { query, init, close };
