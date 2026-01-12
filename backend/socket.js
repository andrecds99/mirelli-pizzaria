// socket.js
const { Server } = require('socket.io');
let io = null;

function initSocket(server) {
    io = new Server(server, {
        cors: { origin: process.env.FRONTEND_URL, methods: ["GET", "POST"] }
    });

    io.on('connection', socket => {
        console.log('🔌 Socket conectado:', socket.id);

        socket.on('disconnect', () => {
            console.log('🔌 Socket desconectado:', socket.id);
        });

        // Evento opcional: admin pode solicitar atualização de pedidos
        socket.on('request-orders', () => {
            io.emit('refresh-orders');
        });
    });
}

// Função para retornar a instância do socket
function getIO() {
    if (!io) throw new Error("Socket.io não foi inicializado!");
    return io;
}

module.exports = { initSocket, getIO };
