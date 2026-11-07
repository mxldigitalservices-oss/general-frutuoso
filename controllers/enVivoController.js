const Ajuste = require('../models/Ajuste');
const Auditoria = require('../models/sql/Auditoria');
const ajustesSvc = require('../utils/ajustes');
const cache = require('../utils/cache');
const { parseYouTubeId } = require('../utils/video');

const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

exports.form = async (req, res) => {
  const aj = await ajustesSvc.obtenerFresco().catch(() => ajustesSvc.DEFAULTS);
  res.render('admin/en-vivo', { titulo: 'En vivo', aj, errors: [], ok: req.query.ok || null, error: req.query.error || null });
};

exports.guardar = async (req, res, next) => {
  try {
    const titulo = texto(req.body.titulo, 120) || 'Transmisión en vivo';
    const url = texto(req.body.url, 300);
    const errors = [];
    let id = '';
    if (url) {
      id = parseYouTubeId(url);
      if (!id) errors.push('El enlace de YouTube no es válido (usa watch?v=, youtu.be o /live/).');
    }
    const aj = await ajustesSvc.obtenerFresco().catch(() => ajustesSvc.DEFAULTS);
    if (errors.length) {
      return res.status(422).render('admin/en-vivo', { titulo: 'En vivo', aj: { ...aj, enVivo: { titulo, url, youtubeId: aj.enVivo.youtubeId } }, errors, ok: null, error: null });
    }
    const set = { 'enVivo.titulo': titulo, 'enVivo.url': url, 'enVivo.youtubeId': id };
    if (!id) set['interruptores.enVivo'] = false; // sin enlace no puede quedar activa
    await Ajuste.updateOne({ clave: 'sitio' }, { $set: set }, { upsert: true });
    await cache.invalidate();
    await Auditoria.registrar(req.session.user.id, 'editar', 'en-vivo', null, titulo);
    res.redirect('/admin/en-vivo?ok=' + encodeURIComponent('Transmisión guardada'));
  } catch (e) { next(e); }
};
