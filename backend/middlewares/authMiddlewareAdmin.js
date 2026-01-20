// middlewares/authMiddlewareAdmin.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-senha");
    if (!admin) {
      return res.status(403).json({ error: "Usuário não é administrador." });
    }

    req.admin = admin;
    req.adminId = admin._id;

    next();
  } catch (err) {
    console.error("AuthAdmin:", err.message);
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

