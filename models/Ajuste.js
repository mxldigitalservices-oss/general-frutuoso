const mongoose = require('mongoose');

// Configuración del sitio (un solo documento): textos, colores, tipografías, cubrefalta e interruptores.
const ajusteSchema = new mongoose.Schema({
  clave: { type: String, default: 'sitio', unique: true },
  textos: {
    heroEyebrow: String, heroTitulo: String, heroSubtitulo: String,
    tituloLibros: String, tituloRincon: String, tituloNoticias: String, tituloEventos: String,
    tituloPrensa: String, tituloMilitar: String, tituloLiteraria: String,
    piePagina: String
  },
  menu: {
    inicio: String, biografia: String, libros: String, rincon: String, noticias: String,
    prensa: String, eventos: String, enVivo: String, contacto: String
  },
  tema: { fondo: String, superficie: String, texto: String, acento: String },
  tipografia: { titulos: String, cuerpo: String },
  cubrefalta: { modo: String, etiqueta: String, colorMarco: String, logo: String },
  interruptores: { eventos: Boolean, enVivo: Boolean },
  enVivo: { titulo: String, url: String, youtubeId: String }
}, { timestamps: true });

module.exports = mongoose.models.Ajuste || mongoose.model('Ajuste', ajusteSchema);
