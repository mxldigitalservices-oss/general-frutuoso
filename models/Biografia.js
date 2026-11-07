const mongoose = require('mongoose');

const linea = new mongoose.Schema({ anio: String, titulo: String, descripcion: String }, { _id: false });

const biografiaSchema = new mongoose.Schema({
  clave: { type: String, default: 'principal', unique: true },
  nombre: { type: String, trim: true, maxlength: 160 },
  titulo: { type: String, trim: true, maxlength: 200 },
  tagline: { type: String, trim: true, maxlength: 300 },
  foto: { type: String, default: '' },
  resumen: [String],
  militar: [linea],
  literaria: [linea]
}, { timestamps: true });

module.exports = mongoose.models.Biografia || mongoose.model('Biografia', biografiaSchema);
