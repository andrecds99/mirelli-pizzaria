const mongoose = require("mongoose");

const enderecoSchema = new mongoose.Schema({
  rua: String,        
  numero: String,
  bairro: String,
  cidade: String,
  estado: String
}, { _id: false });

const clienteSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String,
  telefone: String,
  endereco: enderecoSchema,  
  confirmado: { type: Boolean, default: false },
  tokenConfirmacao: String,
  expiraEm: Date
});

module.exports = mongoose.model("Cliente", clienteSchema);