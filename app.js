const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const env = require('./config/env');
const defaults = require('./config/defaults');
const sessionCfg = require('./config/session');
const ajustesSvc = require('./utils/ajustes');
const tema = require('./utils/tema');
const cache = require('./utils/cache');
const Publicacion = require('./models/Publicacion');
const { media } = require('./controllers/mediaController');

function aplicarAjustes(res, aj) {
  res.locals.ajustes = aj;
  res.locals.temaCss = tema.cssTema(aj);
  res.locals.fuentesUrl = tema.urlFuentes([aj.tipografia.titulos, aj.tipografia.cuerpo]);
}

// Si hay dominio oficial configurado, cualquier otro host (p. ej. *.up.railway.app) redirige a él.
function hostCanonico(req, res, next) {
  if (req.hostname === env.CANONICAL_HOST || !['GET', 'HEAD'].includes(req.method)) return next();
  res.redirect(301, `https://${env.CANONICAL_HOST}${req.originalUrl}`);
}

function crearApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Railway termina HTTPS en su proxy
  app.set('view engine', 'ejs');
  app.set('views', path.join(env.ROOT, 'views'));

  app.get('/healthz', (req, res) => res.type('text').send('ok'));
  if (env.CANONICAL_HOST) app.use(hostCanonico);

  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'img-src': ["'self'", 'data:', 'https://i.ytimg.com'],
        'frame-src': ['https://www.youtube-nocookie.com'],
        'script-src': ["'self'"],
        'form-action': ["'self'"],
        'upgrade-insecure-requests': env.isProd ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false,
    // YouTube exige recibir el origen (referrer) para permitir el video incrustado
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' }
  }));
  app.use(compression());
  app.use(express.static(path.join(env.ROOT, 'public'), { maxAge: env.isProd ? '7d' : 0, index: false }));
  app.get('/media/:id', media);

  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  app.use((req, res, next) => {
    res.locals.site = {
      nombre: 'Juan Manuel Fructuoso Heredia',
      url: env.SITE_URL || `${req.protocol}://${req.get('host')}`,
      whatsapp: `https://wa.me/${env.WHATSAPP}`,
      amazonAutor: 'https://www.amazon.com/s?k=Juan+Manuel+Fructuoso+Heredia',
      correo: env.CONTACT_TO
    };
    res.locals.path = req.path;
    res.locals.build = env.BUILD;
    res.locals.fmtFecha = (d) => new Date(d).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    res.locals.parrafos = (t) => String(t || '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    res.locals.hayPrensa = false;
    aplicarAjustes(res, defaults.ajustes);
    next();
  });

  // Panel: aquí (y solo aquí) existen las sesiones, guardadas en Redis.
  app.use('/admin', sessionCfg.build(), require('./routes/admin'));

  // Sitio público: ajustes (textos, colores, interruptores) con caché en Redis.
  app.use(async (req, res, next) => {
    try {
      const [aj, hayPrensa] = await Promise.all([
        ajustesSvc.obtener(),
        cache.wrapSafe('hayPrensa', 300, async () => !!(await Publicacion.exists({ publicado: true, tipo: 'prensa' })), false)
      ]);
      aplicarAjustes(res, aj);
      res.locals.hayPrensa = hayPrensa;
    } catch (e) { /* se usan los valores por defecto */ }
    next();
  });
  app.use('/', require('./routes/public'));

  app.use((req, res) => res.status(404).render('404'));

  app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).render('error', {
      titulo: 'Algo salió mal',
      mensaje: env.isProd ? 'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.' : err.message
    });
  });

  return app;
}

module.exports = { crearApp };
