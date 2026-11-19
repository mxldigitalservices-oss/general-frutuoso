const Usuario = require('../models/sql/Usuario');

exports.requireAuth = async (req, res, next) => {
  if (!(req.session && req.session.user)) return res.redirect('/admin/login');

  // Una cuenta desactivada pierde el acceso de inmediato, aunque tenga la sesión abierta.
  try {
    if (!(await Usuario.estaActivo(req.session.user.id))) {
      return req.session.destroy(() => { res.clearCookie('fh.sid'); res.redirect('/admin/login'); });
    }
  } catch (e) { console.warn('No se pudo verificar la cuenta activa:', e.message); }

  res.locals.user = req.session.user;
  next();
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (req.session && req.session.user && roles.includes(req.session.user.rol)) return next();
  res.status(403).render('error', { titulo: 'Acceso denegado', mensaje: 'No tienes permiso para esta sección.' });
};
