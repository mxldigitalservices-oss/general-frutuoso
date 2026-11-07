// Configuración de cada módulo del panel. Un módulo = un recurso independiente con su propia ruta.
const Libro = require('../models/Libro');
const Evento = require('../models/Evento');
const Publicacion = require('../models/Publicacion');
const { parseYouTubeId } = require('../utils/video');

// Valida el enlace de YouTube y guarda el ID de 11 caracteres.
function procesarVideo(data, errors) {
  if (data.videoUrl) {
    const id = parseYouTubeId(data.videoUrl);
    if (!id) errors.push('El enlace de YouTube no es válido (usa watch?v=, youtu.be, shorts o live).');
    data.videoYoutubeId = id;
  } else {
    data.videoYoutubeId = '';
  }
}

const TIPOS_EVENTO = ['Presentación de libro', 'Conferencia', 'Firma de libros', 'Entrevista', 'Transmisión', 'Otro']
  .map((t) => ({ value: t, label: t }));

const TIPOS_PUB = [
  { value: 'noticia', label: 'Noticia' },
  { value: 'articulo', label: 'Artículo' },
  { value: 'prensa', label: 'Prensa y reseñas (enlace a un periódico o medio)' },
  { value: 'curiosidad', label: 'Curiosidad / pregunta de la semana (El Rincón del General)' },
  { value: 'reel', label: 'Reel o video corto (El Rincón del General)' }
];

const libros = {
  ruta: 'libros', model: Libro, singular: 'libro', plural: 'Libros', roles: ['admin', 'editor'],
  sort: { orden: 1, createdAt: -1 },
  defaults: () => ({ publicado: true, orden: 100 }),
  columns: [
    { key: 'titulo', label: 'Título' }, { key: 'anio', label: 'Año' },
    { key: 'destacado', label: 'Destacado', type: 'bool' }, { key: 'publicado', label: 'Publicado', type: 'bool' }
  ],
  fields: [
    { name: 'titulo', label: 'Título', type: 'text', required: true, max: 160 },
    { name: 'subtitulo', label: 'Subtítulo o categoría', type: 'text', max: 160 },
    { name: 'anio', label: 'Año de publicación', type: 'number' },
    { name: 'genero', label: 'Género', type: 'text', max: 120 },
    { name: 'paginas', label: 'Páginas', type: 'number' },
    { name: 'precio', label: 'Precio (opcional, ej. $14.99)', type: 'text', max: 40 },
    { name: 'enlaceAmazon', label: 'Enlace de compra en Amazon', type: 'url', help: 'Pega la dirección completa de la página del libro en Amazon.' },
    { name: 'portada', label: 'Portada (JPG, PNG o WEBP, máx. 3 MB)', type: 'image' },
    { name: 'sinopsis', label: 'Sinopsis', type: 'textarea', rows: 8, required: true, max: 4000 },
    { name: 'orden', label: 'Orden (el número menor aparece primero)', type: 'number' },
    { name: 'destacado', label: 'Mostrar en la página de inicio', type: 'checkbox' },
    { name: 'publicado', label: 'Publicado (visible en el sitio)', type: 'checkbox' }
  ]
};

const eventos = {
  ruta: 'eventos', model: Evento, singular: 'evento', plural: 'Eventos', roles: ['admin', 'editor'],
  sort: { fecha: -1 },
  defaults: () => ({ publicado: true, tipo: 'Presentación de libro', fecha: new Date() }),
  columns: [
    { key: 'titulo', label: 'Evento' }, { key: 'fecha', label: 'Fecha', type: 'fecha' },
    { key: 'lugar', label: 'Lugar' }, { key: 'publicado', label: 'Publicado', type: 'bool' }
  ],
  fields: [
    { name: 'titulo', label: 'Título del evento', type: 'text', required: true, max: 160 },
    { name: 'tipo', label: 'Tipo', type: 'select', options: TIPOS_EVENTO },
    { name: 'fecha', label: 'Fecha', type: 'date', required: true },
    { name: 'hora', label: 'Hora (ej. 7:00 PM)', type: 'text', max: 30 },
    { name: 'lugar', label: 'Lugar', type: 'text', required: true, max: 160 },
    { name: 'ciudad', label: 'Ciudad', type: 'text', max: 120 },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', rows: 5, max: 2000 },
    { name: 'mapa', label: 'Enlace al mapa (Google Maps, opcional)', type: 'url' },
    { name: 'videoUrl', label: 'Enlace de YouTube (transmisión o grabación, opcional)', type: 'url', help: 'Se mostrará con el marco institucional (cubrefalta).' },
    { name: 'publicado', label: 'Publicado (visible en el sitio)', type: 'checkbox' }
  ],
  beforeSave: (data, errors) => procesarVideo(data, errors)
};

const publicaciones = {
  ruta: 'publicaciones', model: Publicacion, singular: 'publicación', plural: 'Noticias y curiosidades', roles: ['admin', 'editor'],
  sort: { fecha: -1 },
  defaults: () => ({ publicado: true, tipo: 'noticia', fecha: new Date() }),
  columns: [
    { key: 'titulo', label: 'Título' }, { key: 'tipo', label: 'Tipo' },
    { key: 'fecha', label: 'Fecha', type: 'fecha' }, { key: 'publicado', label: 'Publicado', type: 'bool' }
  ],
  fields: [
    { name: 'tipo', label: 'Tipo de publicación', type: 'select', options: TIPOS_PUB },
    { name: 'medio', label: 'Nombre del medio (ej. Listín Diario) — obligatorio en Prensa y reseñas', type: 'text', max: 80 },
    { name: 'titulo', label: 'Título (en una curiosidad, es la pregunta de la semana)', type: 'text', required: true, max: 200 },
    { name: 'resumen', label: 'Resumen corto (se ve en las tarjetas)', type: 'textarea', rows: 3, required: true, max: 400 },
    { name: 'contenido', label: 'Texto completo o reflexión (separa párrafos con una línea en blanco)', type: 'textarea', rows: 12, max: 20000 },
    { name: 'imagen', label: 'Imagen o fotografía ilustrativa (JPG, PNG o WEBP, máx. 3 MB)', type: 'image' },
    { name: 'videoUrl', label: 'Enlace de YouTube o Shorts (opcional)', type: 'url' },
    { name: 'enlace', label: 'Enlace externo a la nota del periódico o medio (obligatorio en Prensa y reseñas)', type: 'url' },
    { name: 'enlaceTexto', label: 'Texto del botón del enlace (opcional, ej. "Leer la nota completa")', type: 'text', max: 60 },
    { name: 'fecha', label: 'Fecha de publicación', type: 'date' },
    { name: 'publicado', label: 'Publicado (visible en el sitio)', type: 'checkbox' }
  ],
  beforeSave: (data, errors) => {
    procesarVideo(data, errors);
    if ((data.tipo === 'noticia' || data.tipo === 'articulo') && !data.contenido) errors.push('El texto completo es obligatorio en noticias y artículos');
    if (data.tipo === 'prensa') {
      if (!data.enlace) errors.push('En Prensa y reseñas el enlace a la nota es obligatorio');
      if (!data.medio) errors.push('En Prensa y reseñas el nombre del medio es obligatorio');
    }
    if (data.tipo !== 'prensa') data.medio = '';
    if (data.tipo === 'reel' && !data.videoUrl) errors.push('Un reel necesita el enlace de YouTube');
    if (!data.fecha) data.fecha = new Date();
  }
};

// ── Biografía (documento único) ──
const parseLineas = (txt, etiqueta, errors) => String(txt || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
  const p = l.split('|').map((x) => x.trim());
  if (p.length < 2 || !p[1]) { errors.push(`${etiqueta}: la línea "${l.slice(0, 40)}" debe tener el formato Año | Título | Descripción`); return null; }
  return { anio: p[0], titulo: p[1], descripcion: p.slice(2).join(' | ') };
}).filter(Boolean);

const biografia = {
  ruta: 'biografia', singular: 'biografía', plural: 'Sobre mí', roles: ['admin'],
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true, max: 160 },
    { name: 'titulo', label: 'Cargos (ej. General (r) · Abogado · Escritor)', type: 'text', max: 200 },
    { name: 'tagline', label: 'Frase de presentación', type: 'textarea', rows: 2, max: 300 },
    { name: 'foto', label: 'Fotografía (JPG, PNG o WEBP, máx. 3 MB)', type: 'image' },
    { name: 'resumenTxt', label: 'Semblanza (separa los párrafos con una línea en blanco)', type: 'textarea', rows: 12, required: true, max: 8000 },
    { name: 'militarTxt', label: 'Trayectoria militar y jurídica — una línea por hito: Año | Título | Descripción', type: 'textarea', rows: 8, max: 4000 },
    { name: 'literariaTxt', label: 'Trayectoria literaria — una línea por hito: Año | Título | Descripción', type: 'textarea', rows: 6, max: 4000 }
  ],
  beforeSave: (data, errors) => {
    data.resumen = String(data.resumenTxt || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    data.militar = parseLineas(data.militarTxt, 'Trayectoria militar', errors);
    data.literaria = parseLineas(data.literariaTxt, 'Trayectoria literaria', errors);
  },
  aFormulario: (b) => ({
    ...b,
    resumenTxt: (b.resumen || []).join('\n\n'),
    militarTxt: (b.militar || []).map((x) => `${x.anio} | ${x.titulo} | ${x.descripcion || ''}`).join('\n'),
    literariaTxt: (b.literaria || []).map((x) => `${x.anio} | ${x.titulo} | ${x.descripcion || ''}`).join('\n')
  })
};

module.exports = { libros, eventos, publicaciones, biografia };
