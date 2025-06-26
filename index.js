const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

// Rutas del sistema
const whatsappRoutes = require('./routes/whatsapp.routes');
const { qrBase64PorEmpresa } = require('./services/whatsapp.service');

// Inicialización de la app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // indica a Express que se usará EJS
app.set('views', path.join(__dirname, 'views')); // define la carpeta 'views'


// Prefijo de API
app.use('/api/whatsapp', whatsappRoutes);
// Ruta para ver el QR
app.get('/qr-view', (req, res) => {
  const empresaId = req.query.empresaId;
  const qr = qrBase64PorEmpresa[empresaId];

  if (!qr) {
    return res.send('QR no disponible aún.');
  }

  res.render('qr', { qr }); // usa views/qr.ejs
});

// Endpoint de prueba
app.get('/', (req, res) => {
  res.send('Backend WhatsApp activo.');
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

const fs = require('fs');

if (fs.existsSync('/usr/bin/chromium')) {
  console.log('✅ Chromium está en /usr/bin/chromium');
} else if (fs.existsSync('/usr/bin/chromium-browser')) {
  console.log('✅ Chromium-browser está en /usr/bin/chromium-browser');
} else {
  console.error('❌ Chromium no está instalado en /usr/bin');
}
