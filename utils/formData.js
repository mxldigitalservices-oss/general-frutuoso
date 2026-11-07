// Convierte lo enviado por un formulario del panel en datos limpios según la configuración del módulo.
const imagenes = require('./imagenes');

function buildData(cfg, req, existing = null) {
  const data = {};
  const errors = [];
  const images = [];   // imágenes nuevas pendientes de guardar
  const replaced = []; // imágenes anteriores a borrar si todo sale bien
  const files = req.files || {};

  for (const f of cfg.fields) {
    const raw = req.body[f.name];
    const val = typeof raw === 'string' ? raw.trim() : '';

    switch (f.type) {
      case 'checkbox':
        data[f.name] = raw === 'on';
        break;
      case 'number':
        if (val === '') data[f.name] = null;
        else if (!Number.isFinite(Number(val))) errors.push(`${f.label}: número no válido`);
        else data[f.name] = Number(val);
        break;
      case 'date': {
        if (!val) { data[f.name] = null; break; }
        const d = new Date(val);
        if (Number.isNaN(d.getTime())) errors.push(`${f.label}: fecha no válida`);
        else data[f.name] = d;
        break;
      }
      case 'select':
        if (!f.options.some((o) => o.value === val)) errors.push(`${f.label}: opción no válida`);
        data[f.name] = val;
        break;
      case 'image': {
        const file = files[f.name] && files[f.name][0];
        if (file) {
          const err = imagenes.validar(file);
          if (err) errors.push(`${f.label}: ${err}`);
          else {
            images.push({ field: f.name, file });
            if (existing && existing[f.name]) replaced.push(existing[f.name]);
          }
        } else if (req.body['remove_' + f.name] === 'on' && existing && existing[f.name]) {
          data[f.name] = '';
          replaced.push(existing[f.name]);
        }
        break;
      }
      default:
        if (f.type === 'url' && val && !/^https?:\/\/\S+$/i.test(val)) errors.push(`${f.label}: debe empezar con http:// o https://`);
        if (f.max && val.length > f.max) errors.push(`${f.label}: máximo ${f.max} caracteres`);
        data[f.name] = val;
    }

    if (f.required && f.type !== 'image') {
      const vacio = data[f.name] === undefined || data[f.name] === null || data[f.name] === '';
      if (vacio) errors.push(`${f.label} es obligatorio`);
    }
  }

  if (cfg.beforeSave) cfg.beforeSave(data, errors, existing);
  return { data, errors, images, replaced };
}

module.exports = { buildData };
