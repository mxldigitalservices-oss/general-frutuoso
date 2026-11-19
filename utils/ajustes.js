const Ajuste = require('../models/Ajuste');
const cache = require('./cache');
const { ajustes: DEFAULTS } = require('../config/defaults');

// Nombres que antes eran los de fábrica. Si el panel los guardó tal cual, se tratan como "sin personalizar"
// y se usa el nombre actual por defecto (así el sitio ya publicado también adopta los nombres nuevos).
const LEGADO = {
  'menu.inicio': ['Inicio'],
  'menu.biografia': ['Biografía', 'Biografia'],
  'menu.libros': ['Libros', 'Obras', 'Trabajos Publicados'],
  'menu.rincon': ['Rincón del General', 'El Rincón del General'],
  'menu.noticias': ['Noticias'],
  'textos.tituloLibros': ['Obras', 'Libros', 'Trabajos Publicados'],
  'textos.tituloRincon': ['El Rincón del General', 'Rincón del General'],
  'textos.tituloNoticias': ['Noticias y artículos', 'Noticias']
};

const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const esLegado = (ruta, v) => (LEGADO[ruta] || []).some((x) => norm(x) === norm(v));

// Mezcla los ajustes guardados con los valores por defecto (lo vacío vuelve al valor por defecto).
function fusionar(def, doc, ruta = '') {
  const out = {};
  for (const k of Object.keys(def)) {
    const dv = def[k];
    const v = doc ? doc[k] : undefined;
    const clave = ruta ? `${ruta}.${k}` : k;
    if (dv && typeof dv === 'object') out[k] = fusionar(dv, v || {}, clave);
    else if (typeof dv === 'boolean') out[k] = typeof v === 'boolean' ? v : dv;
    else out[k] = v !== undefined && v !== null && v !== '' && !esLegado(clave, v) ? v : dv;
  }
  return out;
}

const leer = async () => fusionar(DEFAULTS, await Ajuste.findOne({ clave: 'sitio' }).lean());

// La clave lleva versión para no servir desde Redis los nombres anteriores tras el despliegue.
exports.obtener = () => cache.wrapSafe('ajustes:v2', 300, leer, DEFAULTS);
exports.obtenerFresco = leer;
exports.DEFAULTS = DEFAULTS;
exports.fusionar = fusionar;
