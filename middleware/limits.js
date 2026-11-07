const rateLimit = require('express-rate-limit');

const base = { standardHeaders: true, legacyHeaders: false };

exports.loginLimiter = rateLimit({
  ...base, windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true,
  handler: (req, res) => res.status(429).render('admin/login', { error: 'Demasiados intentos. Espera 15 minutos.', csrfToken: res.locals.csrfToken })
});

exports.contactLimiter = rateLimit({
  ...base, windowMs: 60 * 60 * 1000, limit: 5,
  handler: (req, res) => res.status(429).render('contacto', { error: 'Has enviado varios mensajes. Inténtalo de nuevo más tarde.', enviado: false, valores: {} })
});
