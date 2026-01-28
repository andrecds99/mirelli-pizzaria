const express = require("express");
const router = express.Router();
const Pedido = require("../models/Pedido");
const authMiddlewareAdmin = require("../middlewares/authMiddlewareAdmin");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

/**
 * LISTAR PEDIDOS
 * filtros:
 *  - status
 *  - pagamento
 *  - periodo=hoje
 *  - taxaPendente=true
 */
router.get("/pedidos", authMiddlewareAdmin, async (req, res) => {
  try {
    const { status, pagamento, periodo, taxaPendente } = req.query;
    const filtro = {};

    if (status) filtro.statusPedido = status;
    if (pagamento) filtro.pagamento = pagamento;

    if (taxaPendente === "true") {
      filtro["taxaEntrega.status"] = "pendente";
    }

    if (periodo === "hoje") {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      filtro.dataPedido = { $gte: hoje };
    }

    const pedidos = await Pedido.find(filtro)
      .populate("cliente", "nome email telefone endereco")
      .sort({ dataPedido: -1 });

    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ATUALIZAR STATUS DO PEDIDO
 */
router.patch("/pedidos/:id/status", authMiddlewareAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    pedido.statusPedido = status;
    await pedido.save();

    res.json({ message: "Status atualizado", pedido });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * CONFIRMAR PAGAMENTO
 */
router.post("/pedidos/:id/confirmar", authMiddlewareAdmin, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });

    pedido.statusPagamento = "pago";
    await pedido.save();

    res.json({ message: "Pagamento confirmado", pedido });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DEFINIR TAXA DE ENTREGA MANUALMENTE (OPERADOR)
 */
router.patch("/pedidos/:id/taxa-entrega", authMiddlewareAdmin, async (req, res) => {
  try {
    const { valor } = req.body;

    if (valor === undefined || valor < 0) {
      return res.status(400).json({ error: "Valor da taxa inválido" });
    }

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    pedido.taxaEntrega = {
      valor,
      status: "definida"
    };

    // Atualiza total somando a taxa
    pedido.total = pedido.total + valor;

    await pedido.save();

    res.json({
      message: "Taxa de entrega definida com sucesso",
      pedido
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * FECHAMENTO DE CAIXA
 */
router.post("/fechar-caixa", authMiddlewareAdmin, async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const pedidosHoje = await Pedido.find({
      dataPedido: { $gte: hoje },
      statusPagamento: "pago"
    });

    const soma = tipo =>
      pedidosHoje
        .filter(p => p.pagamento === tipo)
        .reduce(
          (sum, p) => sum + p.total + (p.taxaEntrega?.valor || 0),
          0
        );

    const totalDinheiro = soma("dinheiro");
    const totalDebito = soma("debito");
    const totalCredito = soma("credito");
    const totalPix = soma("pix");

    const totalGeral =
      totalDinheiro + totalDebito + totalCredito + totalPix;

    const fechamento = {
      operador: req.admin.email,
      data: new Date(),
      totalDinheiro,
      totalDebito,
      totalCredito,
      totalPix,
      totalGeral,
      pedidos: pedidosHoje
    };

    // Auditoria JSON
    const auditoriaPath = path.join(__dirname, "../auditoria/fechamentos.json");
    const auditorias = fs.existsSync(auditoriaPath)
      ? JSON.parse(fs.readFileSync(auditoriaPath))
      : [];

    auditorias.push(fechamento);
    fs.writeFileSync(auditoriaPath, JSON.stringify(auditorias, null, 2));

    // PDF
    const pdfPath = path.join(__dirname, "../auditoria/fechamento-caixa.pdf");
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(18).text("Fechamento de Caixa", { align: "center" });
    doc.moveDown();

    doc.fontSize(12)
      .text(`Operador: ${fechamento.operador}`)
      .text(`Total Dinheiro: R$ ${totalDinheiro.toFixed(2)}`)
      .text(`Total Débito: R$ ${totalDebito.toFixed(2)}`)
      .text(`Total Crédito: R$ ${totalCredito.toFixed(2)}`)
      .text(`Total PIX: R$ ${totalPix.toFixed(2)}`)
      .text(`Total Geral: R$ ${totalGeral.toFixed(2)}`);

    doc.end();

    // CSV
    const parser = new Parser();
    const csv = parser.parse(pedidosHoje);
    fs.writeFileSync(
      path.join(__dirname, "../auditoria/fechamento-caixa.csv"),
      csv
    );

    res.json({ message: "Caixa fechado com sucesso", fechamento });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
