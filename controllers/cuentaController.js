// "Mi cuenta": el propio usuario cambia su nombre, correo y contraseña.
const Usuario = require('../models/sql/Usuario');
const Auditoria = require('../models/sql/Auditoria');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

exports.form = (req, res) => res.render('admin/cuenta', {
  titulo: 'Mi cuenta', errors: [], ok: req.query.ok || null,
  valores: { nombre: req.session.user.nombre, email: req.session.user.email }
});

exports.guardar = async (req, res, next) => {
  try {
    const actual = req.session.user;
    const v = { nombre: texto(req.body.nombre, 120), email: texto(req.body.email, 160).toLowerCase() };
    const claveActual = typeof req.body.claveActual === 'string' ? req.body.claveActual : '';
    const nueva = typeof req.body.claveNueva === 'string' ? req.body.claveNueva : '';
    const nueva2 = typeof req.body.claveNueva2 === 'string' ? req.body.claveNueva2 : '';
    const errors = [];

    if (!v.nombre) errors.push('El nombre es obligatorio.');
    if (!EMAIL.test(v.email)) errors.push('El correo no es válido.');
    if (nueva) {
      if (nueva.length < 10) errors.push('La nueva contraseña debe tener al menos 10 caracteres.');
      else if (nueva.length > 72) errors.push('La nueva contraseña no puede superar 72 caracteres.');
      else if (nueva !== nueva2) errors.push('Las contraseñas nuevas no coinciden.');
      else if (nueva.toLowerCase() === v.email) errors.push('La contraseña no puede ser igual al correo.');
    }
    if (errors.length) return res.status(422).render('admin/cuenta', { titulo: 'Mi cuenta', errors, ok: null, valores: v });

    // Solo si los datos son válidos se confirma la contraseña actual (consulta a la base de datos)
    const verificado = claveActual ? await Usuario.verificar(actual.email, claveActual) : null;
    if (!verificado) return res.status(422).render('admin/cuenta', { titulo: 'Mi cuenta', errors: ['La contraseña actual no es correcta.'], ok: null, valores: v });

    try {
      await Usuario.actualizarCuenta(actual.id, { nombre: v.nombre, email: v.email, clave: nueva || null });
    } catch (e) {
      if (e.code === '23505') return res.status(422).render('admin/cuenta', { titulo: 'Mi cuenta', errors: ['Ese correo ya está en uso por otra cuenta.'], ok: null, valores: v });
      throw e;
    }
    await Auditoria.registrar(actual.id, 'editar', 'cuenta', actual.id, nueva ? 'Cambio de credenciales' : 'Cambio de datos');

    // Nueva sesión tras cambiar credenciales (invalida el identificador anterior)
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.user = { ...actual, nombre: v.nombre, email: v.email };
      req.session.save((e) => (e ? next(e) : res.redirect('/admin/cuenta?ok=' + encodeURIComponent('Datos actualizados'))));
    });
  } catch (e) { next(e); }
};
