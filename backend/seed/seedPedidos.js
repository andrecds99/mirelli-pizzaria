const mongoose = require("mongoose");
const Pedido = require("../models/Pedido");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/painelDB";

const pedidosTeste = [
  {
    numeroPedido: 1001,
    cliente: { nome: "João Silva", telefone: "11999999999", endereco: "Rua A, 123" },
    itens: [
      { produto: { nome: "X-Burguer" }, quantidade: 2, preco: 15 },
      { produto: { nome: "Refrigerante" }, quantidade: 1, preco: 5 },
    ],
    total: 35,
    pagamento: "pix",
    statusPagamento: "novo",
  },
  {
    numeroPedido: 1002,
    cliente: { nome: "Maria Souza", telefone: "11988888888", endereco: "Av. B, 456" },
    itens: [
      { produto: { nome: "Cheeseburger" }, quantidade: 1, preco: 12 },
      { produto: { nome: "Suco" }, quantidade: 2, preco: 8 },
    ],
    total: 28,
    pagamento: "dinheiro",
    statusPagamento: "em preparo",
  },
  {
    numeroPedido: 1003,
    cliente: { nome: "Carlos Lima", telefone: "11977777777", endereco: "Rua C, 789" },
    itens: [
      { produto: { nome: "Batata Frita" }, quantidade: 1, preco: 10 },
      { produto: { nome: "Coca-Cola" }, quantidade: 1, preco: 6 },
    ],
    total: 16,
    pagamento: "credito",
    statusPagamento: "pronto",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB conectado para seed...");

    // Remove pedidos existentes
    await Pedido.deleteMany({});
    console.log("Pedidos antigos removidos.");

    // Insere pedidos de teste
    await Pedido.insertMany(pedidosTeste);
    console.log("Pedidos de teste inseridos com sucesso!");

    mongoose.disconnect();
  } catch (err) {
    console.error("Erro ao inserir seed:", err);
    mongoose.disconnect();
  }
}

seed();
