const router = require('express').Router();
const c = require('../../controllers/videosController');
const { requireRole } = require('../../middleware/auth');

router.use(requireRole('admin', 'editor'));
router.get('/', c.lista);
router.get('/nuevo', c.nuevoForm);
router.post('/nuevo', c.crear);
router.get('/:id/ver', c.cargar, c.ver);
router.get('/:id/descargar', c.cargar, c.descargar);
router.post('/:id/eliminar', c.cargar, c.eliminar);

module.exports = router;
