const router = require('express').Router();
const c = require('../../controllers/enVivoController');
const { requireRole } = require('../../middleware/auth');

router.use(requireRole('admin', 'editor'));
router.get('/', c.form);
router.post('/', c.guardar);

module.exports = router;
