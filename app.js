const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { qrBase64PorEmpresa } = require('./services/whatsapp.service');
dotenv.config();
global.qrBase64PorEmpresa = {};

const whatsappRoutes = require('./routes/whatsapp.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/whatsapp', whatsappRoutes);
app.set('view engine', 'ejs');
app.get('/qr-view', (req, res) => {
  const empresaId = req.query.empresaId;
  const qr = qrBase64PorEmpresa[empresaId];

  if (!qr) {
    return res.send('QR no disponible aún.');
  }

  res.render('qr', { qr });
});

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Backend WhatsApp activo ✔️');
});
app.listen(PORT, () => {
  console.log(`Servidor WhatsApp escuchando en el puerto ${PORT}`);
});
