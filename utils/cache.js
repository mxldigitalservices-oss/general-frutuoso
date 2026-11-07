// Caché de consultas en Redis. Si Redis no está disponible, simplemente se consulta la BD.
const redis = require('../config/redis');
const PREFIX = 'cache:';

async function wrap(key, ttl, loader) {
  const r = redis.isReady() ? redis.getClient() : null;
  if (r) {
    try {
      const hit = await r.get(PREFIX + key);
      if (hit) return JSON.parse(hit);
    } catch { /* se ignora: se consulta la BD */ }
  }
  const data = await loader();
  if (r) {
    try { await r.set(PREFIX + key, JSON.stringify(data), 'EX', ttl); } catch { /* idem */ }
  }
  return data;
}

// Si la consulta falla, devuelve el valor de respaldo (y no lo guarda en caché).
async function wrapSafe(key, ttl, loader, fallback) {
  try { return await wrap(key, ttl, loader); }
  catch (e) { console.error(`Consulta "${key}" falló:`, e.message); return fallback; }
}

async function invalidate() {
  if (!redis.isReady()) return;
  const r = redis.getClient();
  try {
    let cursor = '0';
    do {
      const [next, keys] = await r.scan(cursor, 'MATCH', PREFIX + '*', 'COUNT', 100);
      cursor = next;
      if (keys.length) await r.del(...keys);
    } while (cursor !== '0');
  } catch (e) { console.error('Invalidar caché:', e.message); }
}

module.exports = { wrap, wrapSafe, invalidate };
