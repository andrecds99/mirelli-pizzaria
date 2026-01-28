const express = require("express");
const router = express.Router();

const Pedido = require("../models/Pedido");
const Cliente = require("../models/cliente");
const Counter = require("../models/Counter");
const Idempotency = require("../models/Idempotency");
const TaxaEntrega = require("../models/TaxaEntrega");

const normalizarTexto = require("../utils/normalizarTexto");

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
    // CALCULAR TAXA DE ENTREGA
    // ===============================
    let taxaEntrega = {
      valor: 0,
      status: "pendente"
    };

    if (
      metodoEntrega === "delivery" &&
      enderecoFinal.bairro &&
      enderecoFinal.bairro.trim() !== ""
    ) {
      const bairroNormalizado = normalizarTexto(enderecoFinal.bairro);
    
      const taxaEncontrada = await TaxaEntrega.findOne({
        bairroNormalizado,
        ativo: true
      });
    
      if (taxaEncontrada) {
        taxaEntrega = {
          valor: taxaEncontrada.valor,
          status: "definida"
        };
      }
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


    const express = require("express");
    const router = express.Router();
    
    const TaxaEntrega = require("../models/TaxaEntrega");
    const normalizarTexto = require("../utils/normalizarTexto");
    
    // ===============================
    // LISTAR TODAS AS TAXAS
    // ===============================
    router.get("/", async (req, res) => {
      try {
        const taxas = await TaxaEntrega.find().sort({ bairro: 1 });
        res.json(taxas);
      } catch (err) {
        res.status(500).json({ error: "Erro ao listar taxas" });
      }
    });
    
    // ===============================
    // CRIAR / ATUALIZAR TAXA
    // ===============================
    router.post("/", async (req, res) => {
      try {
        const { bairro, valor, ativo = true } = req.body;
    
        if (!bairro || valor === undefined) {
          return res.status(400).json({ error: "Bairro e valor são obrigatórios" });
        }
    
        const bairroNormalizado = normalizarTexto(bairro);
    
        const taxa = await TaxaEntrega.findOneAndUpdate(
          { bairroNormalizado },
          {
            bairro,
            bairroNormalizado,
            valor,
            ativo
          },
          { new: true, upsert: true }
        );
    
        res.status(201).json(taxa);
    
      } catch (err) {
        res.status(500).json({ error: "Erro ao salvar taxa" });
      }
    });
    
    // ===============================
    // ATIVAR / DESATIVAR
    // ===============================
    router.patch("/:id/ativo", async (req, res) => {
      try {
        const taxa = await TaxaEntrega.findByIdAndUpdate(
          req.params.id,
          { ativo: req.body.ativo },
          { new: true }
        );
    
        res.json(taxa);
      } catch {
        res.status(500).json({ error: "Erro ao atualizar status" });
      }
    });
    
    module.exports = router;
    
    const totalComTaxa =
      total + (taxaEntrega.status === "definida" ? taxaEntrega.valor : 0);

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
    
      taxaEntrega,
    
      total: totalComTaxa,
    
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
