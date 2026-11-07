const router = require('express').Router();
const c = require('../../controllers/cuentaController');

router.get('/', c.form);
router.post('/', c.guardar);

module.exports = router;
