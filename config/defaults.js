// Contenido inicial y valores por defecto. Todo es editable desde el panel de administración.
module.exports = {
  ajustes: {
    textos: {
      heroEyebrow: 'General (r) · Abogado · Escritor',
      heroTitulo: 'Juan Manuel Fructuoso Heredia',
      heroSubtitulo: 'Más de 30 años al servicio de la verdad — primero en las calles, ahora en las páginas.',
      tituloLibros: 'Obras',
      tituloRincon: 'El Rincón del General',
      tituloNoticias: 'Noticias y artículos',
      tituloEventos: 'Eventos',
      tituloPrensa: 'En la prensa',
      tituloMilitar: 'Trayectoria militar y jurídica',
      tituloLiteraria: 'Trayectoria literaria',
      piePagina: '© Juan Manuel Fructuoso Heredia. Todos los derechos reservados.'
    },
    menu: {
      inicio: 'Inicio', biografia: 'Biografía', libros: 'Libros', rincon: 'Rincón del General', noticias: 'Noticias',
      prensa: 'Prensa', eventos: 'Eventos', enVivo: 'En vivo', contacto: 'Contacto'
    },
    tema: { fondo: '#0b0e14', superficie: '#151b28', texto: '#f3ecd8', acento: '#c9a84c' },
    tipografia: { titulos: 'playfair', cuerpo: 'inter' },
    cubrefalta: { modo: 'marco', etiqueta: 'Canal oficial · Juan Manuel Fructuoso Heredia', colorMarco: '', logo: '' },
    interruptores: { eventos: true, enVivo: false },
    enVivo: { titulo: 'Transmisión en vivo', url: '', youtubeId: '' }
  },
  biografia: {
    clave: 'principal',
    nombre: 'Juan Manuel Fructuoso Heredia',
    titulo: 'General (r) · Abogado · Escritor',
    tagline: 'Más de 30 años al servicio de la verdad — primero en las calles, ahora en las páginas.',
    foto: '',
    resumen: [
      'Juan Manuel Fructuoso Heredia es abogado, ex General de la Policía Nacional Dominicana y escritor con más de 30 años de experiencia investigativa al servicio de la justicia en República Dominicana.',
      'Su carrera policial le dio acceso de primera mano a los mecanismos internos del crimen organizado, la corrupción institucional y el narcotráfico, experiencias que hoy transforma en narrativa de alto impacto.',
      'Su obra literaria fusiona la rigurosidad investigativa con la tensión del thriller policial, ofreciendo al lector dominicano y latinoamericano una mirada sin filtros a décadas de oscuros eventos que marcaron al país.'
    ],
    militar: [
      { anio: '1990s–2022', titulo: 'General de la Policía Nacional Dominicana', descripcion: 'Más de 30 años de carrera investigativa al servicio del Estado dominicano.' },
      { anio: '2000–2010', titulo: 'Investigador del crimen organizado', descripcion: 'Participó directamente en operativos contra el narcotráfico.' },
      { anio: '2022', titulo: 'Abogado en ejercicio', descripcion: 'Litigante activo con especialización en derecho penal.' }
    ],
    literaria: [
      { anio: '2022', titulo: 'Publicación en Amazon KDP', descripcion: 'Lanzamiento de "Capicúa en Ajedrez", disponible mundialmente.' },
      { anio: '2022', titulo: 'Cobertura en Diario Libre', descripcion: 'La narco-novela fue reseñada por medios nacionales.' }
    ]
  },
  libros: [
    {
      slug: 'capicua-en-ajedrez',
      titulo: 'Capicúa en Ajedrez',
      subtitulo: 'Narco-Novela',
      anio: 2022,
      genero: 'Narco-Novela · Thriller',
      paginas: 220,
      precio: '$14.99',
      enlaceAmazon: 'https://www.amazon.com/Capic%C3%BAa-ajedrez-Spanish-Fructuoso-Heredia/dp/B09XSVFKF5',
      sinopsis: 'Una narración basada en hechos reales que devela las operatividades del narcotráfico en República Dominicana entre 2000 y 2010.',
      destacado: true,
      publicado: true,
      orden: 1
    },
    {
      slug: 'la-busqueda',
      titulo: 'La Búsqueda',
      subtitulo: '',
      anio: null,
      genero: '',
      paginas: null,
      precio: '',
      enlaceAmazon: '',
      sinopsis: 'Completa la sinopsis, la portada y el enlace de Amazon desde el panel y marca "Publicado".',
      destacado: true,
      publicado: false,
      orden: 2
    }
  ]
};
