const wppconnect = require("@wppconnect-team/wppconnect");
const fs = require("fs");
const path = require("path");
const qrBase64PorEmpresa = {};

const sesiones = {};

async function initSession(empresaId) {
  if (sesiones[empresaId]) {
    const estado = await sesiones[empresaId].isConnected();
    if (estado) {
      return { success: true, msg: "Sesión ya activa" };
    }
  }

  const client = await wppconnect.create({
    session: empresaId,
    catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(`QR para empresa ${empresaId}:\n${asciiQR}`);
      qrBase64PorEmpresa[empresaId] = base64Qr;
    },
    statusFind: (statusSession, session) => {
      if (
        statusSession === "notLogged" ||
        statusSession === "desconnectedMobile"
      ) {
        delete sesiones[empresaId];
      }
    },
    headless: true,
    logQR: false,
    useChrome: false,
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  sesiones[empresaId] = client;
  return { success: true, msg: "Sesión iniciada", empresaId };
}

async function sendMessage({ empresaId, numero, mensaje, archivo, nombreArchivo }) {
  const client = sesiones[empresaId];
  if (!client) return { success: false, msg: 'Sesión no iniciada' };

  if (!numero || (!mensaje && !archivo)) {
    return { success: false, msg: 'Parámetros incompletos' };
  }

  if (archivo && nombreArchivo) {
    try {
      const buffer = Buffer.from(archivo, 'base64');
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const safeName = path.basename(nombreArchivo);
      const tempPath = path.join(tempDir, `${Date.now()}_${safeName}`);
      fs.writeFileSync(tempPath, buffer);

      // Verificar si el archivo realmente tiene contenido
      const stats = fs.statSync(tempPath);
      if (stats.size === 0) {
        console.warn(`El archivo base64 está vacío en disco. Se enviará solo texto.`);
        await client.sendText(numero, mensaje || '[Archivo vacío no enviado]');
        fs.unlinkSync(tempPath);
        return { success: true, msg: 'Mensaje enviado sin archivo (archivo vacío).' };
      }

      await client.sendFile(numero, tempPath, safeName, mensaje || '');
      fs.unlinkSync(tempPath);
      return { success: true, msg: 'Mensaje con archivo enviado' };

    } catch (error) {
      console.error(`Error al procesar archivo base64:`, error.message);
      try {
        await client.sendText(numero, mensaje || '[Error al enviar archivo]');
      } catch {}
      return { success: false, msg: 'Error al enviar archivo', error: error.message };
    }
  }

  // Solo mensaje sin archivo
  try {
    await client.sendText(numero, mensaje || '');
    return { success: true, msg: 'Mensaje de texto enviado' };
  } catch (error) {
    console.error(`Error al enviar mensaje de texto:`, error.message);
    return { success: false, msg: 'Error al enviar texto', error: error.message };
  }
}


async function estadoSesion(empresaId) {
  const client = sesiones[empresaId];
  return {
    success: !!client,
    msg: client ? "Sesión activa" : "Sesión no iniciada",
  };
}

module.exports = {
  initSession,
  sendMessage,
  sesiones,
  qrBase64PorEmpresa,
  estadoSesion,
};
