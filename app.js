const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const whatsappRoutes = require('./routes/whatsapp.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/whatsapp', whatsappRoutes);

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Backend WhatsApp activo ✔️');
});
app.listen(PORT, () => {
  console.log(`Servidor WhatsApp escuchando en el puerto ${PORT}`);
});
