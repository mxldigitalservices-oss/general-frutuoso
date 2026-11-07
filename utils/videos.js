// Almacenamiento de videos en MongoDB (GridFS): no depende del disco de Railway.
const fs = require('fs');
const mongoose = require('mongoose');

const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'videos' });

// Detecta MP4 / MOV / WebM por los primeros bytes del archivo (no confía en la extensión).
exports.tipoPorFirma = async (ruta) => {
  const fh = await fs.promises.open(ruta, 'r');
  try {
    const b = Buffer.alloc(12);
    await fh.read(b, 0, 12, 0);
    if (b.subarray(4, 8).toString('ascii') === 'ftyp') return b.subarray(8, 12).toString('ascii') === 'qt  ' ? 'video/quicktime' : 'video/mp4';
    if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'video/webm';
    return null;
  } finally { await fh.close(); }
};

exports.guardar = (ruta, nombre, mime) => new Promise((resolve, reject) => {
  const subida = bucket().openUploadStream(nombre, { contentType: mime });
  fs.createReadStream(ruta).on('error', reject).pipe(subida)
    .on('error', reject)
    .on('finish', () => resolve(subida.id));
});

exports.eliminar = (id) => bucket().delete(id).catch(() => {});
exports.info = async (id) => (await bucket().find({ _id: id }).limit(1).toArray())[0] || null;
// "fin" es exclusivo (convención de GridFS)
exports.leer = (id, inicio, fin) => bucket().openDownloadStream(id, { start: inicio, end: fin });

exports.extension = (mime) => ({ 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm' }[mime] || 'mp4');
