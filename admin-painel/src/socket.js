// src/socket.js
import { io } from "socket.io-client";

let socket = null;

/**
 * Inicializa (ou retorna) socket com token (opcional).
 * @param {string|null} token - token admin (Bearer token)
 * @returns socket
 */
export function initSocket(token = null) {
  if (socket) return socket;

  const BACKEND = process.env.REACT_APP_API_URL || "http://localhost:3000";

  socket = io(BACKEND, {
    auth: token ? { token } : {},
    transports: ["websocket", "polling"]
  });

  socket.on("connect", () => {
    console.log("Socket conectado", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket desconectado:", reason);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
