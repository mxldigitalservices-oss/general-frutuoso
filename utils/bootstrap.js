// Siembra el contenido inicial solo si las colecciones están vacías (no pisa lo que el General ya editó).
const Libro = require('../models/Libro');
const Biografia = require('../models/Biografia');
const defaults = require('../config/defaults');

exports.sembrarSiVacio = async () => {
  if ((await Libro.countDocuments()) === 0) {
    for (const l of defaults.libros) await Libro.create(l);
    console.log('✔ Libros iniciales creados');
  }
  if ((await Biografia.countDocuments()) === 0) {
    await Biografia.create(defaults.biografia);
    console.log('✔ Biografía inicial creada');
  }
};
