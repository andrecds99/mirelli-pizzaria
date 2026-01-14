const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.cliente) {
            return res.status(403).json({ error: "Acesso negado. Usuário não é cliente." });
        }

        req.clienteId = decoded.id; // ID do cliente
        next();
    } catch (err) {
        return res.status(400).json({ error: "Token inválido." });
    }
};
