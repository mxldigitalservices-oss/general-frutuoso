const crypto = require('crypto');

// Token CSRF por sesión. Debe ejecutarse DESPUÉS de multer para leer campos multipart.
module.exports = function csrf(req, res, next) {
  if (!req.session) return next(new Error('Sesión no disponible'));
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  res.locals.csrfToken = req.session.csrf;

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const enviado = String((req.body && req.body._csrf) || req.get('x-csrf-token') || '');
  const a = Buffer.from(enviado);
  const b = Buffer.from(req.session.csrf);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();

  res.status(403).render('error', { titulo: 'Sesión caducada', mensaje: 'El formulario expiró. Vuelve atrás, recarga la página e inténtalo de nuevo.' });
};
