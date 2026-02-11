const mongoose = require("mongoose");

const enderecoSchema = new mongoose.Schema({
  logradouro: String,
  numero: String,
  bairro: String,
  cidade: String,
  cep: String,
  observacoes: String
}, { _id: false });

const clienteSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String,
  telefone: String,

  // 🔥 agora pode ser string antiga OU objeto novo
  endereco: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  confirmado: { type: Boolean, default: false },
  codigoConfirmacao: String,
  expiraEm: Date
});

module.exports = mongoose.model("Cliente", clienteSchema);
