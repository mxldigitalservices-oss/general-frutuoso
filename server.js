const env = require('./config/env');
const pg = require('./config/postgres');
const mongo = require('./config/mongo');
const redis = require('./config/redis');

async function main() {
  const servicios = [['PostgreSQL', () => pg.init()], ['MongoDB', () => mongo.connect()], ['Redis', () => redis.connect()]];
  const resultados = await Promise.allSettled(servicios.map(([, f]) => f()));
  const fallos = resultados
    .map((r, i) => (r.status === 'rejected' ? `${servicios[i][0]}: ${r.reason.message}` : null))
    .filter(Boolean);

  if (fallos.length) {
    fallos.forEach((f) => console.error('✖', f));
    if (env.STRICT_BOOT) { console.error('Arranque cancelado (STRICT_BOOT).'); process.exit(1); }
    console.warn('⚠ Modo degradado: el sitio arranca, pero con funciones limitadas.');
  }

  if (resultados[1].status === 'fulfilled') {
    await require('./utils/bootstrap').sembrarSiVacio().catch((e) => console.error('Siembra inicial:', e.message));
  }

  const { crearApp } = require('./app');
  const server = crearApp().listen(env.PORT, () => console.log(`✔ Portal en el puerto ${env.PORT}`));
  server.keepAliveTimeout = 65 * 1000;          // mayor que el del proxy de Railway
  server.headersTimeout = 66 * 1000;
  server.requestTimeout = 15 * 60 * 1000;       // permite subir videos de hasta 100 MB con conexión lenta

  const apagar = (senal) => {
    console.log(`${senal}: cerrando…`);
    server.close(async () => {
      await Promise.allSettled([pg.close(), mongo.close(), redis.close()]);
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 10000).unref();
  };
  process.on('SIGTERM', () => apagar('SIGTERM'));
  process.on('SIGINT', () => apagar('SIGINT'));
}

process.on('unhandledRejection', (e) => console.error('Promesa sin manejar:', e));
main().catch((e) => { console.error(e); process.exit(1); });
