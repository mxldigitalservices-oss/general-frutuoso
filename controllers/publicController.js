const Libro = require('../models/Libro');
const Evento = require('../models/Evento');
const Publicacion = require('../models/Publicacion');
const Biografia = require('../models/Biografia');
const Mensaje = require('../models/sql/Mensaje');
const cache = require('../utils/cache');
const mail = require('../utils/mail');
const defaults = require('../config/defaults');

const TTL = 300;
const TIPOS_NOTICIA = ['noticia', 'articulo'];
const TIPOS_RINCON = ['curiosidad', 'reel'];
const TIPO_PRENSA = 'prensa';
const SLUG = /^[a-z0-9-]{1,120}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hoy = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d; };
const pagina = (req) => Math.min(Math.max(parseInt(req.query.p, 10) || 1, 1), 500);
const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

exports.inicio = async (req, res) => {
  const d = await cache.wrapSafe('home', TTL, async () => {
    const [libros, eventos, noticias, rincon, prensa] = await Promise.all([
      Libro.find({ publicado: true }).sort({ destacado: -1, orden: 1 }).limit(3).lean(),
      Evento.find({ publicado: true, fecha: { $gte: hoy() } }).sort({ fecha: 1 }).limit(3).lean(),
      Publicacion.find({ publicado: true, tipo: { $in: TIPOS_NOTICIA } }).sort({ fecha: -1 }).limit(3).select('-contenido').lean(),
      Publicacion.findOne({ publicado: true, tipo: { $in: TIPOS_RINCON } }).sort({ fecha: -1 }).lean(),
      Publicacion.find({ publicado: true, tipo: TIPO_PRENSA }).sort({ fecha: -1 }).limit(3).select('-contenido').lean()
    ]);
    return { libros, eventos, noticias, rincon, prensa };
  }, { libros: [], eventos: [], noticias: [], rincon: null, prensa: [] });
  res.render('index', d);
};

exports.biografia = async (req, res) => {
  const bio = await cache.wrapSafe('bio', TTL, () => Biografia.findOne({ clave: 'principal' }).lean(), null);
  res.render('biografia', { bio: bio || defaults.biografia });
};

exports.libros = async (req, res) => {
  const libros = await cache.wrapSafe('libros', TTL, () => Libro.find({ publicado: true }).sort({ orden: 1 }).lean(), []);
  res.render('libros', { libros });
};

exports.libro = async (req, res, next) => {
  if (!SLUG.test(req.params.slug)) return next();
  const libro = await cache.wrapSafe(`libro:${req.params.slug}`, TTL, () => Libro.findOne({ slug: req.params.slug, publicado: true }).lean(), null);
  if (!libro) return next();
  res.render('libro-detalle', { libro });
};

exports.noticias = async (req, res) => {
  const p = pagina(req); const LIM = 9;
  const d = await cache.wrapSafe(`noticias:${p}`, TTL, async () => {
    const q = { publicado: true, tipo: { $in: TIPOS_NOTICIA } };
    const [items, total] = await Promise.all([
      Publicacion.find(q).sort({ fecha: -1 }).skip((p - 1) * LIM).limit(LIM).select('-contenido').lean(),
      Publicacion.countDocuments(q)
    ]);
    return { items, total };
  }, { items: [], total: 0 });
  res.render('noticias', { items: d.items, p, paginas: Math.max(1, Math.ceil(d.total / LIM)) });
};

exports.noticia = async (req, res, next) => {
  if (!SLUG.test(req.params.slug)) return next();
  const item = await cache.wrapSafe(`noticia:${req.params.slug}`, TTL,
    () => Publicacion.findOne({ slug: req.params.slug, publicado: true, tipo: { $in: TIPOS_NOTICIA } }).lean(), null);
  if (!item) return next();
  res.render('noticia-detalle', { item });
};

exports.prensa = async (req, res) => {
  const p = pagina(req); const LIM = 9;
  const d = await cache.wrapSafe(`prensa:${p}`, TTL, async () => {
    const q = { publicado: true, tipo: TIPO_PRENSA };
    const [items, total] = await Promise.all([
      Publicacion.find(q).sort({ fecha: -1 }).skip((p - 1) * LIM).limit(LIM).select('-contenido').lean(),
      Publicacion.countDocuments(q)
    ]);
    return { items, total };
  }, { items: [], total: 0 });
  res.render('prensa', { items: d.items, p, paginas: Math.max(1, Math.ceil(d.total / LIM)) });
};

exports.rincon = async (req, res) => {
  const p = pagina(req); const LIM = 9;
  const d = await cache.wrapSafe(`rincon:${p}`, TTL, async () => {
    const q = { publicado: true, tipo: { $in: TIPOS_RINCON } };
    const [items, total] = await Promise.all([
      Publicacion.find(q).sort({ fecha: -1 }).skip((p - 1) * LIM).limit(LIM).lean(),
      Publicacion.countDocuments(q)
    ]);
    return { items, total };
  }, { items: [], total: 0 });
  res.render('rincon', { items: d.items, p, paginas: Math.max(1, Math.ceil(d.total / LIM)) });
};

exports.eventos = async (req, res, next) => {
  if (!res.locals.ajustes.interruptores.eventos) return next();
  const d = await cache.wrapSafe('eventos', TTL, async () => {
    const [proximos, pasados] = await Promise.all([
      Evento.find({ publicado: true, fecha: { $gte: hoy() } }).sort({ fecha: 1 }).lean(),
      Evento.find({ publicado: true, fecha: { $lt: hoy() } }).sort({ fecha: -1 }).limit(12).lean()
    ]);
    return { proximos, pasados };
  }, { proximos: [], pasados: [] });
  res.render('eventos', d);
};

exports.enVivo = async (req, res, next) => {
  const aj = res.locals.ajustes;
  if (!aj.interruptores.enVivo) return next();
  const proximos = aj.interruptores.eventos
    ? await cache.wrapSafe('eventos:proximos', TTL, () => Evento.find({ publicado: true, fecha: { $gte: hoy() } }).sort({ fecha: 1 }).limit(3).lean(), [])
    : [];
  res.render('en-vivo', { proximos });
};

exports.contactoForm = (req, res) =>
  res.render('contacto', { error: null, enviado: req.query.ok === '1', valores: {} });

exports.contactoEnviar = async (req, res) => {
  const v = { nombre: texto(req.body.nombre, 120), email: texto(req.body.email, 160), mensaje: texto(req.body.mensaje, 3000) };
  if (req.body.web) return res.redirect('/contacto?ok=1'); // campo trampa para bots

  let error = null;
  if (v.nombre.length < 2) error = 'Escribe tu nombre.';
  else if (!EMAIL.test(v.email)) error = 'Escribe un correo válido.';
  else if (v.mensaje.length < 10) error = 'El mensaje es muy corto.';
  if (error) return res.status(422).render('contacto', { error, enviado: false, valores: v });

  const [guardado, enviado] = await Promise.allSettled([
    Mensaje.crear({ ...v, ip: req.ip }),
    mail.notificarContacto(v)
  ]);
  if (guardado.status === 'rejected') console.error('Guardar mensaje:', guardado.reason.message);
  if (enviado.status === 'rejected') console.error('Enviar correo:', enviado.reason.message);

  const ok = guardado.status === 'fulfilled' || (enviado.status === 'fulfilled' && enviado.value);
  if (!ok) return res.status(503).render('contacto', { error: 'No pudimos enviar tu mensaje ahora. Escríbenos por WhatsApp o inténtalo más tarde.', enviado: false, valores: v });
  res.redirect('/contacto?ok=1');
};

exports.sitemap = async (req, res) => {
  const base = res.locals.site.url;
  const aj = res.locals.ajustes;
  const d = await cache.wrapSafe('sitemap', TTL, async () => ({
    libros: await Libro.find({ publicado: true }).select('slug updatedAt').lean(),
    noticias: await Publicacion.find({ publicado: true, tipo: { $in: TIPOS_NOTICIA } }).select('slug updatedAt').lean()
  }), { libros: [], noticias: [] });

  const urls = ['/', '/biografia', '/libros', '/noticias', '/rincon-del-general', '/contacto'];
  if (res.locals.hayPrensa) urls.push('/prensa');
  if (aj.interruptores.eventos) urls.push('/eventos');
  const filas = urls.map((u) => `<url><loc>${base}${u}</loc></url>`);
  d.libros.forEach((l) => filas.push(`<url><loc>${base}/libros/${l.slug}</loc><lastmod>${new Date(l.updatedAt).toISOString()}</lastmod></url>`));
  d.noticias.forEach((n) => filas.push(`<url><loc>${base}/noticias/${n.slug}</loc><lastmod>${new Date(n.updatedAt).toISOString()}</lastmod></url>`));
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${filas.join('')}</urlset>`);
};

exports.robots = (req, res) =>
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nSitemap: ${res.locals.site.url}/sitemap.xml\n`);
