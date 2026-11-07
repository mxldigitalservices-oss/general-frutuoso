const Libro = require('../models/Libro');
const Evento = require('../models/Evento');
const Publicacion = require('../models/Publicacion');
const Ajuste = require('../models/Ajuste');
const Mensaje = require('../models/sql/Mensaje');
const Auditoria = require('../models/sql/Auditoria');
const ajustesSvc = require('../utils/ajustes');
const cache = require('../utils/cache');

const INTERRUPTORES = { eventos: 'Sección de eventos', enVivo: 'Sección En vivo' };

exports.dashboard = async (req, res) => {
  const seguro = (p) => p.catch(() => null);
  const esAdmin = req.session.user.rol === 'admin';
  const [libros, eventos, publicaciones, noLeidos, actividad, aj] = await Promise.all([
    seguro(Libro.countDocuments()), seguro(Evento.countDocuments()), seguro(Publicacion.countDocuments()),
    seguro(Mensaje.contarNoLeidos()), esAdmin ? seguro(Auditoria.ultimos(8)) : null,
    ajustesSvc.obtenerFresco().catch(() => ajustesSvc.DEFAULTS)
  ]);
  res.render('admin/dashboard', {
    titulo: 'Panel', stats: { libros, eventos, publicaciones, noLeidos }, actividad, aj,
    ok: req.query.ok || null, error: req.query.error || null
  });
};

exports.mensajes = async (req, res, next) => {
  try { res.render('admin/mensajes', { titulo: 'Mensajes', items: await Mensaje.listar(100) }); }
  catch (e) { next(e); }
};

exports.mensajeLeido = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isInteger(id)) await Mensaje.marcarLeido(id);
    res.redirect('/admin/mensajes');
  } catch (e) { next(e); }
};

// Interruptor de un clic: activa o desactiva Eventos / En vivo en el sitio público.
exports.interruptor = async (req, res, next) => {
  try {
    const clave = req.params.clave;
    if (!INTERRUPTORES[clave]) return next();
    const volver = req.body.volver === 'en-vivo' ? '/admin/en-vivo' : '/admin';
    const aj = await ajustesSvc.obtenerFresco();
    const nuevo = !aj.interruptores[clave];

    if (clave === 'enVivo' && nuevo && !aj.enVivo.youtubeId) {
      return res.redirect(`${volver}?error=${encodeURIComponent('Antes de activar, pega el enlace de YouTube de la transmisión en "En vivo".')}`);
    }
    await Ajuste.updateOne({ clave: 'sitio' }, { $set: { [`interruptores.${clave}`]: nuevo } }, { upsert: true });
    await cache.invalidate();
    await Auditoria.registrar(req.session.user.id, nuevo ? 'activar' : 'desactivar', 'interruptor', clave, INTERRUPTORES[clave]);
    res.redirect(`${volver}?ok=${encodeURIComponent(`${INTERRUPTORES[clave]}: ${nuevo ? 'activada' : 'desactivada'}`)}`);
  } catch (e) { next(e); }
};
