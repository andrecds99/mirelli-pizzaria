require("dotenv").config();
require("./database");

const express = require("express");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket");

const pedidoRoutes = require("./routes/pedidoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminPainelRoutes = require("./routes/adminPainelRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const clientesRoutes = require("./routes/clienteRoutes");
const taxaEntregaRoutes = require("./routes/taxaEntregaRoutes");

const app = express();

/* ===============================
   MIDDLEWARES
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   ROTAS
================================ */
// Públicas
app.use("/api/clientes", clientesRoutes);
app.use("/api/pedidos", pedidoRoutes);

// Admin
app.use("/api/admin", adminRoutes);
app.use("/api/adminPainel", adminPainelRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/taxas-entrega", taxaEntregaRoutes);

// Health check
app.get("/", (req, res) => res.send("Servidor rodando!"));

/* ===============================
   SERVER + SOCKET
================================ */
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
