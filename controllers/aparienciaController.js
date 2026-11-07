// Apariencia: títulos del sitio, tipografías, paleta de colores y cubrefalta del reproductor.
const Ajuste = require('../models/Ajuste');
const Auditoria = require('../models/sql/Auditoria');
const ajustesSvc = require('../utils/ajustes');
const tema = require('../utils/tema');
const imagenes = require('../utils/imagenes');
const cache = require('../utils/cache');

const TEXTOS = {
  heroEyebrow: 80, heroTitulo: 120, heroSubtitulo: 300, tituloLibros: 80, tituloRincon: 80,
  tituloNoticias: 80, tituloEventos: 80, piePagina: 200
};
const MODOS = ['ninguno', 'marco', 'franja'];
const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const render = (res, aj, extra = {}) => res.render('admin/apariencia', {
  titulo: 'Apariencia', aj, fuentes: tema.FUENTES, paletas: tema.PALETAS,
  fuentesAdmin: tema.urlFuentes(tema.FUENTES.map((f) => f.id)), errors: [], ok: null, ...extra
});

exports.form = async (req, res) => {
  const aj = await ajustesSvc.obtenerFresco().catch(() => ajustesSvc.DEFAULTS);
  render(res, aj, { ok: req.query.ok || null });
};

exports.guardar = async (req, res, next) => {
  try {
    const actual = await ajustesSvc.obtenerFresco().catch(() => ajustesSvc.DEFAULTS);
    const b = req.body;
    const errors = [];
    if (req.uploadError) errors.push(req.uploadError);

    const textos = {};
    for (const [k, max] of Object.entries(TEXTOS)) textos[k] = texto(b['t_' + k], max);

    const temaNuevo = {};
    for (const k of ['fondo', 'superficie', 'texto', 'acento']) {
      const v = texto(b['c_' + k], 7);
      if (!tema.HEX.test(v)) errors.push(`El color "${k}" no es válido.`); else temaNuevo[k] = v.toLowerCase();
    }
    if (!errors.length) errors.push(...tema.validarTema(temaNuevo));

    const tipografia = { titulos: texto(b.f_titulos, 40), cuerpo: texto(b.f_cuerpo, 40) };
    if (!tema.porId[tipografia.titulos] || !tema.porId[tipografia.cuerpo]) errors.push('Tipografía no válida.');

    const cubrefalta = { modo: texto(b.cf_modo, 10), etiqueta: texto(b.cf_etiqueta, 100), colorMarco: texto(b.cf_colorMarco, 7).toLowerCase() };
    if (!MODOS.includes(cubrefalta.modo)) errors.push('Modo de cubrefalta no válido.');
    if (b.cf_usarAcento === 'on') cubrefalta.colorMarco = '';
    else if (!tema.HEX.test(cubrefalta.colorMarco)) errors.push('El color del marco no es válido.');

    const archivo = req.files && req.files.logo && req.files.logo[0];
    if (archivo) { const e = imagenes.validar(archivo); if (e) errors.push(`Logo: ${e}`); }

    if (errors.length) {
      const aj = { ...actual, textos: { ...actual.textos, ...textos }, tema: { ...actual.tema, ...temaNuevo }, tipografia, cubrefalta: { ...actual.cubrefalta, ...cubrefalta } };
      return res.status(422).render('admin/apariencia', { titulo: 'Apariencia', aj, fuentes: tema.FUENTES, paletas: tema.PALETAS, fuentesAdmin: tema.urlFuentes(tema.FUENTES.map((f) => f.id)), errors, ok: null });
    }

    let creadas = [];
    const reemplazar = [];
    if (archivo) {
      const g = await imagenes.guardar([{ field: 'logo', file: archivo }]);
      creadas = g.creadas; cubrefalta.logo = g.rutas.logo;
      if (actual.cubrefalta.logo) reemplazar.push(actual.cubrefalta.logo);
    } else if (b.remove_logo === 'on' && actual.cubrefalta.logo) {
      cubrefalta.logo = ''; reemplazar.push(actual.cubrefalta.logo);
    } else {
      cubrefalta.logo = actual.cubrefalta.logo;
    }

    try {
      await Ajuste.updateOne({ clave: 'sitio' }, { $set: { textos, tema: temaNuevo, tipografia, cubrefalta } }, { upsert: true });
    } catch (e) { await imagenes.eliminar(creadas); throw e; }

    await imagenes.eliminar(reemplazar);
    await cache.invalidate();
    await Auditoria.registrar(req.session.user.id, 'editar', 'apariencia', null, 'Textos, colores, tipografía y cubrefalta');
    res.redirect('/admin/apariencia?ok=' + encodeURIComponent('Apariencia guardada'));
  } catch (e) { next(e); }
};
