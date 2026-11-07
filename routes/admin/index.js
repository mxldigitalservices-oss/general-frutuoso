const router = require('express').Router();
const auth = require('../../controllers/authController');
const admin = require('../../controllers/adminController');
const { requireAuth, requireRole } = require('../../middleware/auth');
const csrf = require('../../middleware/csrf');
const { parseMultipart } = require('../../middleware/upload');
const { loginLimiter, resetLimiter } = require('../../middleware/limits');

// Orden importante: multer lee los formularios multipart ANTES de validar el token CSRF.
router.use(parseMultipart, csrf);

// Acceso (público)
router.get('/login', auth.loginForm);
router.post('/login', loginLimiter, auth.login);
router.get('/olvide', auth.olvideForm);
router.post('/olvide', resetLimiter, auth.olvide);
router.get('/restablecer/:token', auth.restablecerForm);
router.post('/restablecer/:token', loginLimiter, auth.restablecer);
router.get('/setup', auth.setupForm);
router.post('/setup', loginLimiter, auth.setup);

// Todo lo demás exige sesión
router.use(requireAuth);
router.post('/logout', auth.logout);
router.get('/', admin.dashboard);
router.get('/mensajes', admin.mensajes);
router.post('/mensajes/:id/leido', admin.mensajeLeido);
router.post('/interruptor/:clave', requireRole('admin'), admin.interruptor);

// Módulos independientes
router.use('/libros', require('./libros'));
router.use('/eventos', require('./eventos'));
router.use('/en-vivo', require('./enVivo'));
router.use('/publicaciones', require('./publicaciones'));
router.use('/videos', require('./videos'));
router.use('/biografia', require('./biografia'));
router.use('/apariencia', require('./apariencia'));
router.use('/cuenta', require('./cuenta'));

module.exports = router;
