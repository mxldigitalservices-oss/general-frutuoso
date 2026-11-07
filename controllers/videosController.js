// Biblioteca de videos del panel: subir, ver, descargar y eliminar.
const fs = require('fs');
const mongoose = require('mongoose');
const Video = require('../models/Video');
const Auditoria = require('../models/sql/Auditoria');
const videos = require('../utils/videos');
const slugify = require('../utils/slug');

const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

exports.cargar = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next('route');
    req.video = await Video.findById(req.params.id);
    if (!req.video) return next('route');
    next();
  } catch (e) { next(e); }
};

exports.lista = async (req, res, next) => {
  try {
    const items = await Video.find().sort({ createdAt: -1 }).lean();
    res.render('admin/videos', { titulo: 'Videos', items, ok: req.query.ok || null });
  } catch (e) { next(e); }
};

exports.nuevoForm = (req, res) =>
  res.render('admin/video-nuevo', { titulo: 'Subir video', errors: [], valores: {} });

exports.crear = async (req, res, next) => {
  const archivo = req.file;
  try {
    const valores = { titulo: texto(req.body.titulo, 160), nota: texto(req.body.nota, 500) };
    const mostrar = (errors) => res.status(422).render('admin/video-nuevo', { titulo: 'Subir video', errors, valores });
    if (req.uploadError) return mostrar([req.uploadError]);

    const errors = [];
    if (!valores.titulo) errors.push('El título es obligatorio.');
    if (!archivo) errors.push('Elige un archivo de video.');
    let mime = null;
    if (archivo) {
      mime = await videos.tipoPorFirma(archivo.path);
      if (!mime) errors.push('El archivo no es un video MP4, MOV o WebM válido.');
    }
    if (errors.length) return mostrar(errors);

    const nombre = String(archivo.originalname || 'video').slice(0, 120);
    const fileId = await videos.guardar(archivo.path, nombre, mime);
    let doc;
    try {
      doc = await Video.create({ ...valores, archivo: nombre, mime, size: archivo.size, fileId });
    } catch (e) { await videos.eliminar(fileId); throw e; }

    await Auditoria.registrar(req.session.user.id, 'crear', 'videos', doc.id, doc.titulo);
    res.redirect('/admin/videos?ok=' + encodeURIComponent('Video guardado. Ya puedes verlo o descargarlo.'));
  } catch (e) { next(e); }
  finally { if (archivo) fs.promises.unlink(archivo.path).catch(() => {}); }
};

// Envía el archivo. "adjunto" = descarga directa; si no, reproducción en el panel (con soporte de Range para adelantar).
async function enviar(req, res, next, adjunto) {
  try {
    const v = req.video;
    const info = await videos.info(v.fileId);
    if (!info) return next();
    const total = info.length;
    let inicio = 0; let fin = total - 1; let estado = 200;

    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m && !adjunto && total > 0) {
      if (m[1] !== '') { inicio = parseInt(m[1], 10); if (m[2] !== '') fin = Math.min(parseInt(m[2], 10), total - 1); }
      else if (m[2] !== '') { inicio = Math.max(total - parseInt(m[2], 10), 0); }
      if (inicio > fin || inicio >= total) return res.status(416).set('Content-Range', `bytes */${total}`).end();
      estado = 206;
    }

    const nombre = `${slugify(v.titulo) || 'video'}.${videos.extension(v.mime)}`;
    res.status(estado).set({
      'Content-Type': v.mime,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(total ? fin - inicio + 1 : 0),
      'Content-Disposition': `${adjunto ? 'attachment' : 'inline'}; filename="${nombre}"`,
      'Cache-Control': 'private, no-store'
    });
    if (estado === 206) res.set('Content-Range', `bytes ${inicio}-${fin}/${total}`);
    if (!total) return res.end();

    const flujo = videos.leer(v.fileId, inicio, fin + 1);
    flujo.on('error', () => res.destroy());
    res.on('close', () => flujo.destroy());
    flujo.pipe(res);
  } catch (e) { next(e); }
}

exports.ver = (req, res, next) => enviar(req, res, next, false);
exports.descargar = (req, res, next) => enviar(req, res, next, true);

exports.eliminar = async (req, res, next) => {
  try {
    const v = req.video;
    await videos.eliminar(v.fileId);
    await v.deleteOne();
    await Auditoria.registrar(req.session.user.id, 'eliminar', 'videos', v.id, v.titulo);
    res.redirect('/admin/videos?ok=' + encodeURIComponent('Video eliminado'));
  } catch (e) { next(e); }
};
