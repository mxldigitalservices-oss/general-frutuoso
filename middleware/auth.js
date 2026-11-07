exports.requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
    return next();
  }
  res.redirect('/admin/login');
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (req.session && req.session.user && roles.includes(req.session.user.rol)) return next();
  res.status(403).render('error', { titulo: 'Acceso denegado', mensaje: 'No tienes permiso para esta sección.' });
};
