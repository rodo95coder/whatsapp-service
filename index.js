const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Rutas del sistema
const whatsappRoutes = require('./routes/whatsapp.routes');

// Inicialización de la app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prefijo de API
app.use('/api/whatsapp', whatsappRoutes);

// Endpoint de prueba para ver si está vivo
app.get('/', (req, res) => {
  res.send('Backend WhatsApp activo y corriendo correctamente.');
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
