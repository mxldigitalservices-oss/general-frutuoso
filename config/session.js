const session = require('express-session');
const RedisStore = require('connect-redis').default;
const env = require('./env');
const redis = require('./redis');

const CUATRO_HORAS = 4 * 60 * 60 * 1000;

function build() {
  const client = redis.getClient();
  let store;
  if (client) {
    store = new RedisStore({ client, prefix: 'sess:', ttl: CUATRO_HORAS / 1000 });
  } else {
    console.warn('⚠ Sesiones en memoria (sin Redis): solo aceptable en desarrollo');
  }
  return session({
    name: 'fh.sid',
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store,
    cookie: { httpOnly: true, sameSite: 'lax', secure: env.COOKIE_SECURE, maxAge: CUATRO_HORAS }
  });
}

module.exports = { build };
