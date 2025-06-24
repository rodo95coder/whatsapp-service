require('dotenv').config();

function verificarToken(req, res, next) {
  const tokenCliente = req.headers['x-token'];

  if (!tokenCliente || tokenCliente !== process.env.TOKEN_API) {
    return res.status(401).json({ success: false, msg: 'Token inválido o ausente' });
  }

  next();
}

module.exports = verificarToken;