const mongoose = require('mongoose');
const slugPlugin = require('./slugPlugin');

const libroSchema = new mongoose.Schema({
  titulo: { type: String, required: [true, 'El título es obligatorio'], trim: true, maxlength: 160 },
  subtitulo: { type: String, trim: true, maxlength: 160, default: '' },
  anio: { type: Number, default: null },
  genero: { type: String, trim: true, maxlength: 120, default: '' },
  paginas: { type: Number, default: null },
  precio: { type: String, trim: true, maxlength: 40, default: '' },
  enlaceAmazon: { type: String, trim: true, default: '' },
  portada: { type: String, default: '' },
  sinopsis: { type: String, required: [true, 'La sinopsis es obligatoria'], trim: true, maxlength: 4000 },
  orden: { type: Number, default: 100 },
  destacado: { type: Boolean, default: false },
  publicado: { type: Boolean, default: true }
}, { timestamps: true });

libroSchema.plugin(slugPlugin);
libroSchema.index({ publicado: 1, destacado: -1, orden: 1 });

module.exports = mongoose.models.Libro || mongoose.model('Libro', libroSchema);
