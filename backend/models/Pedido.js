const mongoose = require("mongoose");

const PedidoSchema = new mongoose.Schema({
  numeroPedido: { type: Number, required: true },
  cliente: {
    nome: String,
    email: String,
    telefone: String,
    endereco: String
  },
  itens: [
    {
      produto: {
        nome: String,
      },
      quantidade: Number,
      preco: Number
    }
  ],
  total: { type: Number, required: true },
  pagamento: { type: String, enum: ["pix", "dinheiro", "debito", "credito"], required: true },
  statusPagamento: { type: String, enum: ["novo", "em preparo", "pronto", "saiu", "entregue", "cancelado", "pago"], default: "novo" },
  dataPedido: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Pedido", PedidoSchema);
