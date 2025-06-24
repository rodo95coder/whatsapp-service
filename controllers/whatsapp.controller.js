const whatsappService = require("../services/whatsapp.service");

exports.initSession = async (req, res) => {
  const { empresaId } = req.body;
  const result = await whatsappService.initSession(empresaId);
  res.json(result);
};

exports.sendMessage = async (req, res) => {
  const { empresaId, numero, mensaje, archivo, nombreArchivo } = req.body;
  const result = await whatsappService.sendMessage({
    empresaId,
    numero,
    mensaje,
    archivo,
    nombreArchivo,
  });
  res.json(result);
};

exports.estadoSesion = async (req, res) => {
  const { empresaId } = req.query;
  const result = await whatsappService.estadoSesion(empresaId);
  res.json(result);
};

exports.obtenerQR = (req, res) => {
  const { empresaId } = req.query;
  const client = whatsappService.sesiones[empresaId];
  const qr = whatsappService.qrBase64PorEmpresa[empresaId];

  if (!client) {
    return res.status(400).json({
      success: false,
      msg: "Sesión no iniciada. Llama a /init-session.",
    });
  }

  if (!qr) {
    return res.status(404).json({
      success: false,
      msg: "QR no disponible. Asegúrate de escanear el código.",
    });
  }

  return res.json({ success: true, qr });
};
