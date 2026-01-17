const jwt = require("jsonwebtoken");
const Cliente = require("../models/cliente");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const cliente = await Cliente.findById(decoded.id).select("-senha");

    if (!cliente) {
      return res.status(403).json({ error: "Usuário não é cliente." });
    }

    req.cliente = cliente;
    req.clienteId = cliente._id;

    next();
  } catch (err) {
    console.error("AuthCliente:", err.message);
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};
