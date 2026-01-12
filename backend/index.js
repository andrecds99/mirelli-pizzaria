require('dotenv').config();
require('./database');

const express = require('express');
const cors = require('cors');
const { initSocket } = require('./socket');

const pedidoRoutes = require('./routes/pedidoRoutes');
const adminRoutes = require("./routes/adminRoutes");
const adminPainelRoutes = require("./routes/adminPainelRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const clientesRoutes = require('./routes/clienteRoutes');


const app = express();
app.use(cors());
app.use(express.json());

// Rotas principais
app.use('/api/clientes', clientesRoutes); 
app.use('/api/pedidos', pedidoRoutes);

// Rotas administrativas
app.use("/api/admin", adminRoutes);
app.use("/api/adminPainel", adminPainelRoutes);
app.use("/api/admin/auth", adminAuthRoutes);

// Teste rápido
app.get('/', (req, res) => res.send("Servidor rodando!"));

// Criar HTTP server com socket.io
const http = require('http');
const server = http.createServer(app);
initSocket(server);

server.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${process.env.PORT || 3000}`);
});
