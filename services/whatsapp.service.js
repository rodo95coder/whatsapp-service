const wppconnect = require("@wppconnect-team/wppconnect");
const fs = require("fs-extra");
const path = require("path");
const qrBase64PorEmpresa = {};
const sesiones = {};

async function initSession(empresaId) {
  const sessionPath = path.join(__dirname, '../tokens', empresaId);

  // Limpieza si existe una sesión corrupta o bloqueada
  if (fs.existsSync(sessionPath)) {
    try {
      await fs.remove(sessionPath);
      console.log(`Carpeta de sesión eliminada: ${sessionPath}`);
    } catch (err) {
      console.error(`Error al eliminar la carpeta de sesión: ${err.message}`);
    }
  }

  // Validar si ya hay una sesión activa
  if (sesiones[empresaId]) {
    const estado = await sesiones[empresaId].isConnected();
    if (estado) {
      console.log(`Sesión ya activa para ${empresaId}`);
      return { success: true, msg: "Sesión ya activa" };
    }
  }

  // Crear nueva sesión
  const client = await wppconnect.create({
    session: empresaId,
    autoClose: false,
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
    executablePath: '/usr/bin/chromium-browser',
    folderNameToken: './tokens',
    mkdirFolderToken: true,
    waitForLogin: true,
    puppeteerOptions: { //Este timeout es por que el host gratuito maneja una ram limitada.
  protocolTimeout: 60000, // 60 segundos
}
  });

  sesiones[empresaId] = client;

  console.log(`Sesión iniciada para ${empresaId}`);
  return { success: true, msg: "Sesión iniciada", empresaId };
}

async function sendMessage({ empresaId, numeros, mensaje, archivo, nombreArchivo }) {
  const client = sesiones[empresaId];
  if (!client) return { success: false, msg: 'Sesión no iniciada' };

  if (!Array.isArray(numeros) || numeros.length === 0 || (!mensaje && !archivo)) {
    return { success: false, msg: 'Parámetros incompletos: faltan números o mensaje' };
  }

  let tempPath = null;

  // Procesar archivo base64 si existe
  if (archivo && nombreArchivo) {
    try {
      const buffer = Buffer.from(archivo, 'base64');
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const safeName = path.basename(nombreArchivo);
      tempPath = path.join(tempDir, `${Date.now()}_${safeName}`);
      fs.writeFileSync(tempPath, buffer);

      const stats = fs.statSync(tempPath);
      if (stats.size === 0) {
        console.warn(`El archivo base64 está vacío en disco. Se enviará solo texto.`);
        tempPath = null;
      }
    } catch (error) {
      console.error(`Error procesando archivo base64: ${error.message}`);
      tempPath = null;
    }
  }

  // Envío en paralelo a todos los números
  const resultados = await Promise.all(numeros.map(async (numero) => {
    try {
      if (tempPath) {
        await client.sendFile(numero, tempPath, nombreArchivo, mensaje || '');
        return { numero, success: true, msg: 'Archivo enviado' };
      } else {
        await client.sendText(numero, mensaje || '[Mensaje sin archivo]');
        return { numero, success: true, msg: 'Mensaje de texto enviado' };
      }
    } catch (error) {
      console.error(`Error al enviar a ${numero}: ${error.message}`);
      return { numero, success: false, error: error.message };
    }
  }));

  // Limpiar archivo temporal
  if (tempPath && fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }

  const exitosos = resultados.filter(r => r.success).length;
  const fallidos = resultados.filter(r => !r.success);

  return {
    success: true,
    msg: `Enviados ${exitosos} de ${numeros.length}`,
    enviados: exitosos,
    fallidos: fallidos.length,
    detalleFallos: fallidos,
    resultados
  };
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
