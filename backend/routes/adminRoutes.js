const express = require("express");
const router = express.Router();
const Pedido = require("../models/Pedido");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddlewareAdmin = require("../middlewares/authMiddlewareAdmin");

/**
 * Login Admin
 * Acesso: Público
 */
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ error: "E-mail ou senha incorretos" });

        const senhaValida = await bcrypt.compare(senha, admin.senha);
        if (!senhaValida) return res.status(400).json({ error: "E-mail ou senha incorretos" });

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Listar todos pedidos
 * Acesso: Admin
 */
router.get("/pedidos", authMiddlewareAdmin, async (req, res) => {
    try {
        const pedidos = await Pedido.find().populate("cliente", "nome email telefone");
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Confirmar pagamento PIX
 * Acesso: Admin
 */
router.post("/pedidos/:id/confirmar", authMiddlewareAdmin, async (req, res) => {
    try {
        const pedido = await Pedido.findById(req.params.id);
        if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });

        pedido.statusPagamento = "pago";
        await pedido.save();

        res.json({ message: "Pagamento confirmado!", pedido });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Relatório / Fechamento de Caixa
 * Acesso: Admin
 */
router.get("/relatorio", authMiddlewareAdmin, async (req, res) => {
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const pedidosHoje = await Pedido.find({
            dataPedido: { $gte: hoje }
        });

        const totalDinheiro = pedidosHoje
            .filter(p => p.pagamento === "dinheiro")
            .reduce((sum, p) => sum + p.total, 0);

        const totalDebito = pedidosHoje
            .filter(p => p.pagamento === "debito")
            .reduce((sum, p) => sum + p.total, 0);

        const totalCredito = pedidosHoje
            .filter(p => p.pagamento === "credito")
            .reduce((sum, p) => sum + p.total, 0);

        const totalPix = pedidosHoje
            .filter(p => p.pagamento === "pix")
            .reduce((sum, p) => sum + p.total, 0);

        const totalGeral = totalDinheiro + totalDebito + totalCredito + totalPix;

        res.json({
            totalDinheiro,
            totalDebito,
            totalCredito,
            totalPix,
            totalGeral,
            pedidosHoje
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
