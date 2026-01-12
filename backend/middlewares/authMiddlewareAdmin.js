// Middleware simples de autenticação de admin
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  const token = authHeader.split(" ")[1];
  // Aqui você pode validar o token com JWT ou outro método
  if (token === "admin-token-simulado") {
    req.admin = { email: "admin@loja.com" }; // simulação de admin logado
    next();
  } else {
    res.status(401).json({ error: "Token inválido" });
  }
};
