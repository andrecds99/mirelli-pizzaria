// routes/adminPainelRoutes.js
const express = require("express");
const router = express.Router();
const Pedido = require("../models/Pedido");
const authMiddlewareAdmin = require("../middlewares/authMiddlewareAdmin");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

/**
 * Listar pedidos com filtros opcionais: status, pagamento, período
 */
router.get("/pedidos", authMiddlewareAdmin, async (req, res) => {
  try {
    const { status, pagamento, periodo } = req.query;
    let filtro = {};

    if (status) filtro.statusPagamento = status;
    if (pagamento) filtro.pagamento = pagamento;

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
 * Atualizar status de um pedido
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

    res.json({ message: "Status do pedido atualizado", pedido });
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    res.status(500).json({ error: err.message });
  }
});


/**
 * Confirmar pagamento PIX
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
 * Fechamento de caixa e geração de PDF/CSV
 */
router.post("/fechar-caixa", authMiddlewareAdmin, async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const pedidosHoje = await Pedido.find({ dataPedido: { $gte: hoje } });

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

    // Salvar auditoria
    const auditoriaPath = path.join(__dirname, "../auditoria/fechamentos.json");
    let auditorias = [];
    if (fs.existsSync(auditoriaPath)) {
      auditorias = JSON.parse(fs.readFileSync(auditoriaPath));
    }
    auditorias.push(fechamento);
    fs.writeFileSync(auditoriaPath, JSON.stringify(auditorias, null, 2));

    // Gerar PDF
    const pdfPath = path.join(__dirname, "../auditoria/fechamento-caixa.pdf");
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(18).text("Relatório de Fechamento de Caixa", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Operador: ${fechamento.operador}`);
    doc.text(`Data: ${fechamento.data}`);
    doc.text(`Total Dinheiro: R$ ${totalDinheiro.toFixed(2)}`);
    doc.text(`Total Débito: R$ ${totalDebito.toFixed(2)}`);
    doc.text(`Total Crédito: R$ ${totalCredito.toFixed(2)}`);
    doc.text(`Total PIX: R$ ${totalPix.toFixed(2)}`);
    doc.text(`Total Geral: R$ ${totalGeral.toFixed(2)}`);
    doc.moveDown();

    doc.text("Pedidos:");
    fechamento.pedidos.forEach((pedido, i) => {
      doc.text(
        `${i + 1}) Pedido #${pedido.numeroPedido} - Cliente: ${pedido.cliente?.nome || "Anônimo"} - Total: R$ ${pedido.total.toFixed(2)} - Pagamento: ${pedido.pagamento} - Status: ${pedido.statusPagamento}`
      );
    });

    doc.end();

    // Gerar CSV
    const csvPath = path.join(__dirname, "../auditoria/fechamento-caixa.csv");
    const parser = new Parser();
    const csv = parser.parse(fechamento.pedidos);
    fs.writeFileSync(csvPath, csv);

    res.json({
      message: "Caixa fechado com sucesso!",
      fechamento,
      pdfPath: `/auditoria/fechamento-caixa.pdf`,
      csvPath: `/auditoria/fechamento-caixa.csv`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Relatório de pedidos do dia (opcional)
 */
router.get("/relatorio", authMiddlewareAdmin, async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const pedidosHoje = await Pedido.find({
      dataPedido: { $gte: hoje },
      statusPagamento: "pago"
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
