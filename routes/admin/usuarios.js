const router = require('express').Router();
const c = require('../../controllers/usuariosController');

router.get('/', c.lista);
router.get('/nuevo', c.nuevoForm);
router.post('/nuevo', c.crear);
router.post('/:id/estado', c.cambiarEstado);

module.exports = router;
