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
