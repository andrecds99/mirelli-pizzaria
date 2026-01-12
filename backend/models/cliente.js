// models/cliente.js
const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String,
  telefone: String,
  endereco: String,
  confirmado: { type: Boolean, default: false },
  tokenConfirmacao: String,
  expiraEm: Date
});

module.exports = mongoose.model('Cliente', clienteSchema);
