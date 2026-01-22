  const mongoose = require("mongoose");

  const ItemSchema = new mongoose.Schema(
    {
      produto: {
        nome: { type: String, required: true },
        sabor: String,
        meioASabor: String,
        tamanho: String,
        borda: String,
        observacoes: String
      },
      quantidade: { type: Number, default: 1 },
      preco: { type: Number, required: true }
    },
    { _id: false }
  );

  const EnderecoSchema = new mongoose.Schema(
    {
      tipo: {
        type: String,
        enum: ["cadastrado", "alternativo"],
        required: true
      },
      logradouro: String,
      numero: String,
      bairro: String,
      cidade: String,
      cep: String,
      observacoes: String
    },
    { _id: false }
  );

  const PedidoSchema = new mongoose.Schema({
    numeroPedido: {
      type: Number,
      required: true,
      unique: true
    },

    // Referência real ao cliente
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true
    },

    // Snapshot do cliente no momento do pedido
    clienteInfo: {
      nome: { type: String, required: true },
      telefone: { type: String, required: true }
    },

    endereco: {
      type: EnderecoSchema,
      required: true
    },

    itens: {
      type: [ItemSchema],
      validate: v => v.length > 0
    },

    total: {
      type: Number,
      required: true
    },

    pagamento: {
      type: String,
      enum: ["pix", "dinheiro", "debito", "credito"],
      required: true
    },

    trocoPara: {
      type: Number,
      default: null
    },

    statusPagamento: {
      type: String,
      enum: ["pendente", "pago"],
      default: "pendente"
    },

    metodoEntrega: {
      type: String,
      enum: ["delivery", "retirada"],
      default: "delivery"
    },

    observacoes: String,

    tokenPix: String,

    statusPedido: {
      type: String,
      enum: [
        "novo",
        "em preparo",
        "saiu",
        "concluido",
        "cancelado"
      ],
      default: "novo"
    },
    

    dataPedido: {
      type: Date,
      default: Date.now
    }
  });

  module.exports = mongoose.model("Pedido", PedidoSchema);
