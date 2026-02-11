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
    console.error("Erro ao listar taxas:", err);
    res.status(500).json({ error: "Erro ao listar taxas" });
  }
});

// ===============================
// CRIAR / ATUALIZAR TAXA
// ===============================
router.post("/", async (req, res) => {
  try {
    const { bairro, valor, ativo = true } = req.body;

    // 🔧 VALIDAÇÃO: Bairro obrigatório e valor numérico positivo
    if (!bairro || bairro.trim() === "" || valor == null || typeof valor !== "number" || valor <= 0) {
      return res.status(400).json({ error: "Bairro (não vazio) e valor (número positivo) são obrigatórios" });
    }

    const bairroNormalizado = normalizarTexto(bairro);
    if (!bairroNormalizado) {
      return res.status(400).json({ error: "Bairro inválido após normalização" });
    }

    const taxa = await TaxaEntrega.findOneAndUpdate(
      { bairroNormalizado },
      {
        bairro: bairro.trim(),
        bairroNormalizado,
        valor,
        ativo
      },
      { new: true, upsert: true }
    );

    res.status(201).json(taxa);

  } catch (err) {
    console.error("Erro ao salvar taxa:", err);
    res.status(500).json({ error: "Erro ao salvar taxa" });
  }
});

// ===============================
// ATIVAR / DESATIVAR
// ===============================
router.patch("/:id/ativo", async (req, res) => {
  try {
    const { ativo } = req.body;
    if (typeof ativo !== "boolean") {
      return res.status(400).json({ error: "Campo 'ativo' deve ser true ou false" });
    }

    const taxa = await TaxaEntrega.findByIdAndUpdate(
      req.params.id,
      { ativo },
      { new: true }
    );

    if (!taxa) {
      return res.status(404).json({ error: "Taxa não encontrada" });
    }

    res.json(taxa);
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

module.exports = router;