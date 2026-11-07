const mongoose = require('mongoose');

// Biblioteca privada de videos (solo visible en el panel). El archivo vive en GridFS (colección "videos").
const videoSchema = new mongoose.Schema({
  titulo: { type: String, required: [true, 'El título es obligatorio'], trim: true, maxlength: 160 },
  nota: { type: String, trim: true, maxlength: 500, default: '' },
  archivo: { type: String, default: '' },      // nombre original del archivo
  mime: { type: String, required: true },
  size: { type: Number, default: 0 },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

module.exports = mongoose.models.Video || mongoose.model('Video', videoSchema);
