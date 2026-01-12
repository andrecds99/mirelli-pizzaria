const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ error: "Administrador não encontrado" });
        }

        const senhaValida = await bcrypt.compare(senha, admin.senha);
        if (!senhaValida) {
            return res.status(400).json({ error: "Senha incorreta" });
        }

        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            message: "Login realizado com sucesso",
            token,
            admin: {
                nome: admin.nome,
                email: admin.email
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
