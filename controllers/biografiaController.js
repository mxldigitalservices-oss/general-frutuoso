const Biografia = require('../models/Biografia');
const cfg = require('../config/modulos').biografia;
const defaults = require('../config/defaults');
const { buildData } = require('../utils/formData');
const imagenes = require('../utils/imagenes');
const cache = require('../utils/cache');
const Auditoria = require('../models/sql/Auditoria');

const vista = (res, extra) => res.render('admin/form', {
  cfg, base: '/admin/biografia', action: '/admin/biografia', titulo: 'Sobre mí', esNuevo: false, unico: true, errors: [], ok: null, ...extra
});

exports.form = async (req, res) => {
  const bio = await Biografia.findOne({ clave: 'principal' }).lean().catch(() => null);
  vista(res, { item: cfg.aFormulario(bio || defaults.biografia), ok: req.query.ok || null });
};

exports.guardar = async (req, res, next) => {
  const actual = await Biografia.findOne({ clave: 'principal' }).lean().catch(() => null);
  const previo = actual || defaults.biografia;
  const mostrar = (data, errors) => res.status(422).render('admin/form', {
    cfg, base: '/admin/biografia', action: '/admin/biografia', titulo: 'Sobre mí', esNuevo: false, unico: true, errors, ok: null,
    item: { ...cfg.aFormulario(previo), ...data }
  });

  if (req.uploadError) return mostrar({}, [req.uploadError]);
  const b = buildData(cfg, req, previo);
  if (b.errors.length) return mostrar(b.data, b.errors);

  let creadas = [];
  try {
    const g = await imagenes.guardar(b.images);
    creadas = g.creadas;
    Object.assign(b.data, g.rutas);
    await Biografia.findOneAndUpdate({ clave: 'principal' }, { $set: b.data }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
  } catch (e) {
    await imagenes.eliminar(creadas);
    return next(e);
  }
  await imagenes.eliminar(b.replaced);
  await cache.invalidate();
  await Auditoria.registrar(req.session.user.id, 'editar', 'biografia', null, 'Sobre mí');
  res.redirect('/admin/biografia?ok=' + encodeURIComponent('Biografía guardada'));
};
