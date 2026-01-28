const mongoose = require("mongoose");

const TaxaEntregaSchema = new mongoose.Schema({
  bairro: {
    type: String,
    required: true
  },

  bairroNormalizado: {
    type: String,
    required: true,
    index: true
  },

  valor: {
    type: Number,
    required: true
  },

  ativo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("TaxaEntrega", TaxaEntregaSchema);
