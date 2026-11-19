// Gestión de usuarios del panel: ver, crear administradores y activar/desactivar cuentas.
const Usuario = require('../models/sql/Usuario');
const Auditoria = require('../models/sql/Auditoria');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['admin', 'editor'];
const texto = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const AVISOS = {
  yo: 'No puedes desactivar tu propia cuenta.',
  ultimo: 'No se puede desactivar: debe quedar al menos un administrador activo.',
  nf: 'No se encontró esa cuenta.'
};

const vistaNuevo = (res, status, errors, valores) =>
  res.status(status).render('admin/usuario-nuevo', { titulo: 'Nuevo administrador', errors, valores });

exports.lista = async (req, res, next) => {
  try {
    const items = await Usuario.listar();
    res.render('admin/usuarios', {
      titulo: 'Usuarios', items, errors: [],
      ok: req.query.ok || null,
      error: AVISOS[req.query.err] || null
    });
  } catch (e) { next(e); }
};

exports.nuevoForm = (req, res) => vistaNuevo(res, 200, [], { rol: 'admin' });

exports.crear = async (req, res, next) => {
  try {
    const v = {
      nombre: texto(req.body.nombre, 120),
      email: texto(req.body.email, 160).toLowerCase(),
      rol: ROLES.includes(req.body.rol) ? req.body.rol : 'admin'
    };
    const clave = typeof req.body.clave === 'string' ? req.body.clave : '';
    const clave2 = typeof req.body.clave2 === 'string' ? req.body.clave2 : '';
    const errors = [];

    if (!v.nombre) errors.push('El nombre es obligatorio.');
    if (!EMAIL.test(v.email)) errors.push('El correo no es válido.');
    if (clave.length < 5) errors.push('La contraseña debe tener al menos 5 caracteres.');
    else if (clave.length > 72) errors.push('La contraseña no puede superar 72 caracteres.');
    else if (clave !== clave2) errors.push('Las contraseñas no coinciden.');
    else if (clave.toLowerCase() === v.email) errors.push('La contraseña no puede ser igual al correo.');
    if (errors.length) return vistaNuevo(res, 422, errors, v);

    let u;
    try {
      u = await Usuario.crear({ nombre: v.nombre, email: v.email, clave, rol: v.rol });
    } catch (e) {
      if (e.code === '23505') return vistaNuevo(res, 422, ['Ese correo ya tiene una cuenta. Si está desactivada, reactívala desde la lista.'], v);
      throw e;
    }
    await Auditoria.registrar(req.session.user.id, 'crear', 'usuario', u.id, `${u.email} (${u.rol})`);
    res.redirect('/admin/usuarios?ok=' + encodeURIComponent(`Cuenta creada para ${u.nombre}.`));
  } catch (e) { next(e); }
};

exports.cambiarEstado = async (req, res, next) => {
  try {
    if (!/^\d{1,9}$/.test(req.params.id)) return res.redirect('/admin/usuarios?err=nf');
    const id = Number(req.params.id);
    const activar = req.body.activar === 'true';

    if (!activar && id === req.session.user.id) return res.redirect('/admin/usuarios?err=yo');
    const cambio = await Usuario.cambiarActivo(id, activar);
    if (!cambio) {
      const existe = (await Usuario.listar()).some((u) => u.id === id);
      return res.redirect('/admin/usuarios?err=' + (existe ? 'ultimo' : 'nf'));
    }
    await Auditoria.registrar(req.session.user.id, 'editar', 'usuario', id, activar ? 'Cuenta activada' : 'Cuenta desactivada');
    res.redirect('/admin/usuarios?ok=' + encodeURIComponent(activar ? 'Cuenta activada.' : 'Cuenta desactivada.'));
  } catch (e) { next(e); }
};
