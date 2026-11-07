const crypto = require('crypto');
const env = require('../config/env');
const Usuario = require('../models/sql/Usuario');
const Auditoria = require('../models/sql/Auditoria');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

const setupDisponible = async () => !!env.SETUP_TOKEN && (await Usuario.contar()) === 0;

exports.loginForm = async (req, res) => {
  if (req.session.user) return res.redirect('/admin');
  try { if (await setupDisponible()) return res.redirect('/admin/setup'); } catch (e) { /* BD no disponible: se muestra el login */ }
  res.render('admin/login', { error: null, ok: req.query.ok || null });
};

exports.login = async (req, res, next) => {
  try {
    const u = await Usuario.verificar(texto(req.body.email, 160), typeof req.body.clave === 'string' ? req.body.clave.slice(0, 200) : '');
    if (!u) return res.status(401).render('admin/login', { error: 'Correo o contraseña incorrectos.', ok: null });
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.user = { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol };
      Usuario.registrarAcceso(u.id);
      Auditoria.registrar(u.id, 'login', 'sesion', null, null);
      req.session.save((e) => (e ? next(e) : res.redirect('/admin')));
    });
  } catch (e) { next(e); }
};

exports.logout = (req, res) => {
  req.session.destroy(() => { res.clearCookie('fh.sid'); res.redirect('/admin/login'); });
};

// Primer acceso: el General crea su propia cuenta. Solo existe mientras no haya usuarios y haya SETUP_TOKEN.
exports.setupForm = async (req, res, next) => {
  try {
    if (!(await setupDisponible())) return res.redirect('/admin/login');
    res.render('admin/setup', { errors: [], valores: {} });
  } catch (e) { next(e); }
};

exports.setup = async (req, res, next) => {
  try {
    if (!(await setupDisponible())) return res.redirect('/admin/login');
    const v = { nombre: texto(req.body.nombre, 120), email: texto(req.body.email, 160).toLowerCase() };
    const { token, clave, clave2 } = req.body;
    const errors = [];
    if (!crypto.timingSafeEqual(sha(token || ''), sha(env.SETUP_TOKEN))) errors.push('El código de configuración no es correcto.');
    if (!v.nombre) errors.push('El nombre es obligatorio.');
    if (!EMAIL.test(v.email)) errors.push('El correo no es válido.');
    if (typeof clave !== 'string' || clave.length < 10) errors.push('La contraseña debe tener al menos 10 caracteres.');
    else if (clave.length > 72) errors.push('La contraseña no puede superar 72 caracteres.');
    else if (clave !== clave2) errors.push('Las contraseñas no coinciden.');
    if (errors.length) return res.status(422).render('admin/setup', { errors, valores: v });

    const u = await Usuario.guardar({ nombre: v.nombre, email: v.email, clave, rol: 'admin' });
    await Auditoria.registrar(u.id, 'crear', 'cuenta', u.id, 'Cuenta de administrador creada');
    res.redirect('/admin/login?ok=' + encodeURIComponent('Cuenta creada. Ya puedes iniciar sesión.'));
  } catch (e) { next(e); }
};
