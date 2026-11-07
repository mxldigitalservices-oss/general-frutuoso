const crypto = require('crypto');
const os = require('os');
const path = require('path');
const multer = require('multer');

const aviso = (mensaje) => Object.assign(new Error(mensaje), { userMessage: mensaje });

// Imágenes: se reciben en memoria y se guardan en MongoDB.
const imagenes = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024, files: 3, fields: 60, fieldSize: 100 * 1024 }
}).fields([
  { name: 'portada', maxCount: 1 },
  { name: 'imagen', maxCount: 1 },
  { name: 'foto', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]);

// Videos: se escriben primero en la carpeta temporal (no en memoria) y luego pasan a GridFS.
const VIDEOS_OK = ['.mp4', '.mov', '.webm'];
const MAX_VIDEO_MB = 100;
const videos = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (req, file, cb) => cb(null, 'fhv-' + crypto.randomBytes(12).toString('hex') + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: MAX_VIDEO_MB * 1024 * 1024, files: 1, fields: 10, fieldSize: 100 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video' && VIDEOS_OK.includes(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(aviso('El video debe ser MP4, MOV o WebM.'));
  }
}).single('video');

// No corta la petición si falla: deja el mensaje en req.uploadError para mostrarlo en el formulario.
exports.parseMultipart = (req, res, next) => {
  const esVideo = req.path.startsWith('/videos');
  (esVideo ? videos : imagenes)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') req.uploadError = esVideo ? `El video supera el máximo de ${MAX_VIDEO_MB} MB.` : 'La imagen supera los 3 MB. Reduce su tamaño e inténtalo de nuevo.';
      else req.uploadError = err.userMessage || 'No se pudo procesar el archivo enviado.';
    }
    next();
  });
};
