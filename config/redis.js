const Redis = require('ioredis');
const env = require('./env');

let client = null;
let lastLog = 0;

async function connect() {
  if (!env.REDIS_URL) throw new Error('REDIS_URL no está definida');
  client = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: (n) => Math.min(n * 300, 5000)
  });
  client.on('error', (e) => {
    // Evita inundar el log si Redis se cae
    if (Date.now() - lastLog > 30000) { lastLog = Date.now(); console.error('Redis:', e.message); }
  });
  await client.connect();
  console.log('✔ Redis listo');
}

const getClient = () => client;
const isReady = () => !!client && client.status === 'ready';

async function close() {
  if (client) await client.quit().catch(() => {});
}

module.exports = { connect, getClient, isReady, close };
