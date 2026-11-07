const Imagen = require('../models/Imagen');

const MAX_BYTES = 3 * 1024 * 1024;
const RUTA = /^\/media\/([a-f0-9]{24})$/;

// Detecta el tipo real por los primeros bytes (no confía en el nombre ni en el mime enviado).
function tipoPorFirma(b) {
  if (!b || b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}

// Devuelve un mensaje de error o null si la imagen es válida.
exports.validar = (file) => {
  if (file.size > MAX_BYTES) return 'La imagen supera los 3 MB. Reduce su tamaño e inténtalo de nuevo.';
  if (!tipoPorFirma(file.buffer)) return 'El archivo no es una imagen JPG, PNG o WEBP válida.';
  return null;
};

// items: [{ field, file }] → { rutas: { campo: '/media/id' }, creadas: ['/media/id', ...] }
exports.guardar = async (items = []) => {
  const rutas = {};
  const creadas = [];
  for (const { field, file } of items) {
    const doc = await Imagen.create({
      data: file.buffer, mime: tipoPorFirma(file.buffer), nombre: String(file.originalname || '').slice(0, 120), size: file.size
    });
    rutas[field] = '/media/' + doc.id;
    creadas.push(rutas[field]);
  }
  return { rutas, creadas };
};

exports.eliminar = async (rutas = []) => {
  const ids = rutas.map((r) => (RUTA.exec(r || '') || [])[1]).filter(Boolean);
  if (ids.length) await Imagen.deleteMany({ _id: { $in: ids } }).catch(() => {});
};
