const express = require("express");
const router = express.Router();

const Pedido = require("../models/Pedido");
const Cliente = require("../models/cliente");
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
    // ===============================
    // IDEMPOTÊNCIA
    // ===============================
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

    // ===============================
    // VALIDAÇÃO BÁSICA
    // ===============================
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: "Itens inválidos" });
    }

    if (!total || !pagamento || !endereco) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    // ===============================
    // BUSCA CLIENTE REAL
    // ===============================
    const clienteDB = await Cliente.findById(req.clienteId);
    if (!clienteDB) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // ===============================
    // NORMALIZA ENDEREÇO
    // ===============================
    let enderecoFinal;

    if (typeof endereco === "string") {
      enderecoFinal = {
        tipo: "cadastrado",
        logradouro: endereco,
        numero: "",
        bairro: "",
        cidade: "",
        cep: "",
        observacoes: ""
      };
    } else {
      enderecoFinal = {
        tipo: endereco.tipo || "cadastrado",
        logradouro: endereco.logradouro || "",
        numero: endereco.numero || "",
        bairro: endereco.bairro || "",
        cidade: endereco.cidade || "",
        cep: endereco.cep || "",
        observacoes: endereco.observacoes || ""
      };
    }

    // ===============================
    // NÚMERO SEQUENCIAL
    // ===============================
    const counter = await Counter.findOneAndUpdate(
      { name: "pedido" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const numeroPedido = counter.seq;

    // ===============================
    // TOKEN PIX (placeholder)
    // ===============================
    const tokenPix = pagamento === "pix" ? `PED-${Date.now()}` : null;

    // ===============================
    // CRIAÇÃO DO PEDIDO
    // ===============================
    const pedido = new Pedido({
      numeroPedido,

      cliente: clienteDB._id,

      clienteInfo: {
        nome: clienteDB.nome,
        telefone: telefone || clienteDB.telefone
      },

      endereco: enderecoFinal,

      itens,

      total,

      pagamento,

      trocoPara: pagamento === "dinheiro" ? trocoPara : null,

      observacoes: observacoes || "",

      metodoEntrega: metodoEntrega || "delivery",

      tokenPix,

      statusPagamento: "pendente"
    });

    await pedido.save();

    // ===============================
    // IDEMPOTÊNCIA
    // ===============================
    await Idempotency.create({ key: idKey });

    // ===============================
    // SOCKET.IO
    // ===============================
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
