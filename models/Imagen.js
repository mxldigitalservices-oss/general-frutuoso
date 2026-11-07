const mongoose = require('mongoose');

// Las imágenes viven en MongoDB (Railway no conserva el disco entre despliegues).
// Se sirven en /media/:id con caché de larga duración.
const imagenSchema = new mongoose.Schema({
  data: { type: Buffer, required: true, select: false },
  mime: { type: String, required: true },
  nombre: { type: String, default: '' },
  size: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Imagen || mongoose.model('Imagen', imagenSchema);
