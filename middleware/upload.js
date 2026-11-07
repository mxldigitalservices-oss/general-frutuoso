const multer = require('multer');

// Las imágenes se reciben en memoria y se guardan en MongoDB. Los videos NO se suben: van por YouTube.
const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024, files: 3, fields: 60, fieldSize: 100 * 1024 }
}).fields([
  { name: 'portada', maxCount: 1 },
  { name: 'imagen', maxCount: 1 },
  { name: 'foto', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]);

// No corta la petición si falla: deja el mensaje en req.uploadError para mostrarlo en el formulario.
exports.parseMultipart = (req, res, next) => {
  uploader(req, res, (err) => {
    if (err) {
      req.uploadError = err.code === 'LIMIT_FILE_SIZE'
        ? 'La imagen supera los 3 MB. Reduce su tamaño e inténtalo de nuevo.'
        : 'No se pudo procesar el archivo enviado.';
    }
    next();
  });
};
