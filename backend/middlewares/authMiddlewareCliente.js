const jwt = require("jsonwebtoken");

module.exports = function authMiddlewareCliente(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔎 LOG CORRETO (agora dentro do escopo)
    console.log("JWT DECODED:", decoded);

    // 🔐 Garante que é cliente
    if (!decoded.cliente) {
      return res.status(403).json({ error: "Acesso não autorizado." });
    }

    // Disponibiliza dados para as rotas
    req.clienteId = decoded.id;
    req.tokenPayload = decoded;

    next();
  } catch (err) {
    console.error("Erro no authMiddlewareCliente:", err.message);
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};
