const express = require('express');
const router = express.Router();
const controller = require('../controllers/whatsapp.controller');
const verificarToken = require('../middleware/auth');


router.post('/send-message', controller.sendMessage);
router.post('/init-session', controller.initSession);

router.get('/estado-sesion', controller.estadoSesion);
router.get('/qr', controller.obtenerQR);

router.use(verificarToken);
module.exports = router;
