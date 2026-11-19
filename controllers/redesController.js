// Redes sociales: enlaces que se muestran en la Página Principal (bajo los botones) y en el pie de página.
const Ajuste = require('../models/Ajuste');
const Auditoria = require('../models/sql/Auditoria');
const ajustesSvc = require('../utils/ajustes');
const redesSvc = require('../utils/redes');
const cache = require('../utils/cache');

const render = (res, aj, extra = {}) => res.render('admin/redes', {
  titulo: 'Redes sociales', aj, lista: redesSvc.REDES, errors: [], ok: null, ...extra
});

exports.form = async (req, res) => {
  const aj = await ajustesSvc.obtenerFresco().catch(() => ajustesSvc.DEFAULTS);
  render(res, aj, { ok: req.query.ok || null });
};

exports.guardar = async (req, res, next) => {
  try {
    const { redes, errors } = redesSvc.desdeFormulario(req.body);
    if (errors.length) {
      const actual = await ajustesSvc.obtenerFresco().catch(() => ajustesSvc.DEFAULTS);
      return res.status(422).render('admin/redes', {
        titulo: 'Redes sociales', aj: { ...actual, redes }, lista: redesSvc.REDES, errors, ok: null
      });
    }

    // Se guardan todas las redes: una casilla vacía borra el enlace y la red deja de mostrarse en el sitio.
    await Ajuste.updateOne({ clave: 'sitio' }, { $set: { redes } }, { upsert: true });
    await cache.invalidate(); // el cambio se refleja de inmediato en el sitio público
    const activas = Object.values(redes).filter(Boolean).length;
    await Auditoria.registrar(req.session.user.id, 'editar', 'redes', null, `Redes sociales (${activas} con enlace)`);
    res.redirect('/admin/redes?ok=' + encodeURIComponent('Redes sociales guardadas'));
  } catch (e) { next(e); }
};
