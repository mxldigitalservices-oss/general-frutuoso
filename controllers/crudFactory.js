// Genera un módulo CRUD completo (listar, crear, editar, eliminar) a partir de su configuración.
const express = require('express');
const mongoose = require('mongoose');
const { buildData } = require('../utils/formData');
const imagenes = require('../utils/imagenes');
const cache = require('../utils/cache');
const Auditoria = require('../models/sql/Auditoria');
const { requireRole } = require('../middleware/auth');

module.exports = function crudFactory(cfg) {
  const router = express.Router();
  const base = `/admin/${cfg.ruta}`;
  const camposImagen = cfg.fields.filter((f) => f.type === 'image').map((f) => f.name);

  router.use(requireRole(...cfg.roles));

  const vista = (res, nombre, extra) =>
    res.render(nombre, { cfg, base, titulo: cfg.plural, errors: [], ok: null, ...extra });

  async function cargar(req, res, next) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) return next('route');
      req.doc = await cfg.model.findById(req.params.id);
      if (!req.doc) return next('route');
      next();
    } catch (e) { next(e); }
  }

  async function tras(req, accion, doc) {
    await cache.invalidate();
    await Auditoria.registrar(req.session.user.id, accion, cfg.ruta, doc.id, doc.titulo);
  }

  async function guardar(req, res, next, doc) {
    const esNuevo = !doc;
    const action = esNuevo ? `${base}/nuevo` : `${base}/${doc.id}/editar`;
    const previo = doc ? doc.toObject() : {};
    const mostrar = (data, errors) => res.status(422).render('admin/form', {
      cfg, base, titulo: cfg.plural, action, esNuevo, errors, ok: null, item: { ...previo, ...data }
    });

    if (req.uploadError) return mostrar({}, [req.uploadError]);
    const b = buildData(cfg, req, doc ? previo : null);
    if (b.errors.length) return mostrar(b.data, b.errors);

    let creadas = [];
    try {
      const g = await imagenes.guardar(b.images);
      creadas = g.creadas;
      Object.assign(b.data, g.rutas);
      if (doc) { doc.set(b.data); await doc.save(); } else { doc = await cfg.model.create(b.data); }
    } catch (e) {
      await imagenes.eliminar(creadas);
      if (e.name === 'ValidationError') return mostrar(b.data, Object.values(e.errors).map((x) => x.message));
      return next(e);
    }
    await imagenes.eliminar(b.replaced);
    await tras(req, esNuevo ? 'crear' : 'editar', doc);
    res.redirect(`${base}?ok=${encodeURIComponent(esNuevo ? 'Guardado correctamente' : 'Cambios guardados')}`);
  }

  router.get('/', async (req, res, next) => {
    try { vista(res, 'admin/list', { items: await cfg.model.find().sort(cfg.sort).lean(), ok: req.query.ok || null }); }
    catch (e) { next(e); }
  });

  router.get('/nuevo', (req, res) => vista(res, 'admin/form', { item: cfg.defaults(), action: `${base}/nuevo`, esNuevo: true }));
  router.post('/nuevo', (req, res, next) => guardar(req, res, next, null));

  router.get('/:id/editar', cargar, (req, res) =>
    vista(res, 'admin/form', { item: req.doc.toObject(), action: `${base}/${req.doc.id}/editar`, esNuevo: false }));
  router.post('/:id/editar', cargar, (req, res, next) => guardar(req, res, next, req.doc));

  router.post('/:id/eliminar', cargar, async (req, res, next) => {
    try {
      const doc = req.doc;
      await imagenes.eliminar(camposImagen.map((c) => doc[c]));
      await doc.deleteOne();
      await tras(req, 'eliminar', doc);
      res.redirect(`${base}?ok=${encodeURIComponent('Eliminado')}`);
    } catch (e) { next(e); }
  });

  return router;
};
