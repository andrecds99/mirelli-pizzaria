const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const authMiddlewareCliente = require('../middlewares/authMiddlewareCliente');
const Counter = require('../models/Counter');
const Idempotency = require('../models/Idempotency');
const { getIO } = require('../socket'); // socket.js precisa exportar io

router.post('/', authMiddlewareCliente, async (req, res) => {
    const idKey = req.header('Idempotency-Key');
    if (!idKey) return res.status(400).json({ error: 'Idempotency-Key obrigatório' });

    try {
        const existing = await Idempotency.findOne({ key: idKey });
        if (existing) return res.status(409).json({ error: 'Pedido já processado anteriormente' });

        const { itens, total, pagamento, endereco, telefone, trocoPara, observacoes, metodoEntrega } = req.body;

        if (!itens || !total || !pagamento || !endereco || !telefone) {
            return res.status(400).json({ error: "Todos os campos obrigatórios" });
        }

        // Número sequencial do pedido
        const counter = await Counter.findOneAndUpdate(
            { name: "pedido" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const numeroPedido = counter.seq;

        // Token PIX
        const tokenPix = pagamento === "pix" ? "PED" + Date.now() : null;

        const pedido = new Pedido({
            cliente: req.clienteId,
            numeroPedido,
            itens,
            total,
            pagamento,
            endereco,
            telefone,
            trocoPara,
            observacoes,
            metodoEntrega,
            tokenPix,
            statusPagamento: pagamento === "pix" ? "pendente" : "pago"
        });

        await pedido.save();
        await Idempotency.create({ key: idKey });

        // Emitir novo pedido para painel administrativo
        const io = getIO();
        io.emit('new-order', pedido);

        res.status(201).json({
            pedido,
            mensagem: pagamento === "pix"
                ? `Pagamento via PIX selecionado. Use o token: ${tokenPix}`
                : "Pedido criado com pagamento no local."
        });

    } catch (err) {
        console.error("Erro no pedidoRoutes:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
