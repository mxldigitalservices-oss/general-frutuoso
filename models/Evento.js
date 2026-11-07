const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  titulo: { type: String, required: [true, 'El título es obligatorio'], trim: true, maxlength: 160 },
  tipo: { type: String, trim: true, maxlength: 40, default: 'Evento' },
  fecha: { type: Date, required: [true, 'La fecha es obligatoria'] },
  hora: { type: String, trim: true, maxlength: 30, default: '' },
  lugar: { type: String, required: [true, 'El lugar es obligatorio'], trim: true, maxlength: 160 },
  ciudad: { type: String, trim: true, maxlength: 120, default: '' },
  descripcion: { type: String, trim: true, maxlength: 2000, default: '' },
  mapa: { type: String, trim: true, default: '' },
  videoUrl: { type: String, trim: true, default: '' },      // transmisión o grabación en YouTube
  videoYoutubeId: { type: String, default: '' },
  publicado: { type: Boolean, default: true }
}, { timestamps: true });

eventoSchema.index({ publicado: 1, fecha: 1 });

module.exports = mongoose.models.Evento || mongoose.model('Evento', eventoSchema);
