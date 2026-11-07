const Ajuste = require('../models/Ajuste');
const cache = require('./cache');
const { ajustes: DEFAULTS } = require('../config/defaults');

// Mezcla los ajustes guardados con los valores por defecto (lo vacío vuelve al valor por defecto).
function fusionar(def, doc) {
  const out = {};
  for (const k of Object.keys(def)) {
    const dv = def[k];
    const v = doc ? doc[k] : undefined;
    if (dv && typeof dv === 'object') out[k] = fusionar(dv, v || {});
    else if (typeof dv === 'boolean') out[k] = typeof v === 'boolean' ? v : dv;
    else out[k] = v !== undefined && v !== null && v !== '' ? v : dv;
  }
  return out;
}

const leer = async () => fusionar(DEFAULTS, await Ajuste.findOne({ clave: 'sitio' }).lean());

exports.obtener = () => cache.wrapSafe('ajustes', 300, leer, DEFAULTS);
exports.obtenerFresco = leer;
exports.DEFAULTS = DEFAULTS;
