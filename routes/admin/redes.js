const router = require('express').Router();
const c = require('../../controllers/redesController');
const { requireRole } = require('../../middleware/auth');

router.use(requireRole('admin'));
router.get('/', c.form);
router.post('/', c.guardar);

module.exports = router;
