const router = require('express').Router();
const c = require('../controllers/publicController');
const { contactLimiter } = require('../middleware/limits');

router.get('/', c.inicio);
router.get('/biografia', c.biografia);
router.get('/libros', c.libros);
router.get('/libros/:slug', c.libro);
router.get('/noticias', c.noticias);
router.get('/noticias/:slug', c.noticia);
router.get('/rincon-del-general', c.rincon);
router.get('/eventos', c.eventos);
router.get('/en-vivo', c.enVivo);
router.get('/contacto', c.contactoForm);
router.post('/contacto', contactLimiter, c.contactoEnviar);
router.get('/sitemap.xml', c.sitemap);
router.get('/robots.txt', c.robots);

module.exports = router;
