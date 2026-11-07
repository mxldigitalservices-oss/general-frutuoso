const mongoose = require('mongoose');
const slugPlugin = require('./slugPlugin');

// Noticias, artículos, curiosidades (El Rincón del General) y reels de YouTube.
const publicacionSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['noticia', 'articulo', 'curiosidad', 'reel'], default: 'noticia' },
  titulo: { type: String, required: [true, 'El título es obligatorio'], trim: true, maxlength: 200 },
  resumen: { type: String, required: [true, 'El resumen es obligatorio'], trim: true, maxlength: 400 },
  contenido: { type: String, trim: true, maxlength: 20000, default: '' },
  imagen: { type: String, default: '' },
  videoUrl: { type: String, trim: true, default: '' },
  videoYoutubeId: { type: String, default: '' },
  enlace: { type: String, trim: true, default: '' },
  enlaceTexto: { type: String, trim: true, maxlength: 60, default: '' },
  fecha: { type: Date, default: Date.now },
  publicado: { type: Boolean, default: true }
}, { timestamps: true });

publicacionSchema.plugin(slugPlugin);
publicacionSchema.index({ publicado: 1, tipo: 1, fecha: -1 });

module.exports = mongoose.models.Publicacion || mongoose.model('Publicacion', publicacionSchema);
