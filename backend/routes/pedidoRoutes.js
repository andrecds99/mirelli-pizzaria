const express = require("express");
const router = express.Router();

const Pedido = require("../models/Pedido");
const Cliente = require("../models/cliente"); // ✅ BUSCA REAL NO BANCO
const Counter = require("../models/Counter");
const Idempotency = require("../models/Idempotency");

const authMiddlewareCliente = require("../middlewares/authMiddlewareCliente");
const { getIO } = require("../socket");

router.post("/", authMiddlewareCliente, async (req, res) => {
  const idKey = req.header("Idempotency-Key");

  if (!idKey) {
    return res.status(400).json({ error: "Idempotency-Key obrigatório" });
  }

  try {
    // 🔁 Evita pedido duplicado
    const existing = await Idempotency.findOne({ key: idKey });
    if (existing) {
      return res.status(409).json({ error: "Pedido já processado" });
    }

    const {
      itens,
      total,
      pagamento,
      endereco,
      telefone,
      trocoPara,
      observacoes,
      metodoEntrega
    } = req.body;

    // 🔒 Validação básica
    if (!itens || !itens.length || !total || !pagamento || !endereco || !telefone) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    // 👤 Busca cliente REAL no banco
    const clienteDB = await Cliente.findById(req.clienteId);
    if (!clienteDB) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // 🔢 Número sequencial do pedido
    const counter = await Counter.findOneAndUpdate(
      { name: "pedido" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const numeroPedido = counter.seq;

    // 💠 Token PIX simples (placeholder)
    const tokenPix = pagamento === "pix" ? `PED-${Date.now()}` : null;

    // 📦 Criação do pedido
    const pedido = new Pedido({
      numeroPedido,

      cliente: clienteDB._id,

      clienteInfo: {
        nome: clienteDB.nome,          // ✅ GARANTIDO
        telefone: telefone || clienteDB.telefone
      },

      endereco, // ⚠️ já validado pelo schema

      itens,

      total,

      pagamento,

      trocoPara: pagamento === "dinheiro" ? trocoPara : null,

      observacoes,

      metodoEntrega: metodoEntrega || "delivery",

      tokenPix,

      statusPagamento: pagamento === "pix" ? "pendente" : "pago"
    });

    await pedido.save();

    // 🧾 Marca idempotência
    await Idempotency.create({ key: idKey });

    // 📡 Envia pedido em tempo real para o painel admin
    const io = getIO();
    io.emit("new-order", pedido);

    return res.status(201).json({
      pedido,
      mensagem:
        pagamento === "pix"
          ? "Pedido criado. Aguarde confirmação do PIX."
          : "Pedido criado com sucesso."
    });

  } catch (err) {
    console.error("Erro pedidoRoutes:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
