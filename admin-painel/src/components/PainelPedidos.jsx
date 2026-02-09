import React, { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

export default function PainelPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState("");

  const tokenAdmin = localStorage.getItem("adminToken");

  const buscarPedidos = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/adminPainel/pedidos${
          statusFiltro ? "?status=" + statusFiltro : ""
        }`,
        {
          headers: { Authorization: "Bearer " + tokenAdmin },
        }
      );
      setPedidos(res.data);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
    }
  }, [statusFiltro, tokenAdmin]);

  useEffect(() => {
    buscarPedidos();

    socket.on("connect", () => {
      console.log("🔌 Conectado ao Socket.IO (produção)");
    });

    socket.on("new-order", (pedido) => {
      setPedidos((prev) => [pedido, ...prev]);
    });

    return () => {
      socket.off("new-order");
    };
  }, [buscarPedidos]);

  async function confirmarPagamento(id) {
    try {
      await axios.post(
        `${API_URL}/api/adminPainel/pedidos/${id}/confirmar`,
        {},
        { headers: { Authorization: "Bearer " + tokenAdmin } }
      );
      buscarPedidos();
    } catch (err) {
      console.error("Erro ao confirmar pagamento:", err);
    }
  }

  return (
    <div className="painel-pedidos">
      <h2>Pedidos</h2>

      <label>Filtro por status:</label>
      <select
        value={statusFiltro}
        onChange={(e) => setStatusFiltro(e.target.value)}
      >
        <option value="">Todos</option>
        <option value="pendente">Pendente</option>
        <option value="pago">Pago</option>
      </select>

      <button onClick={buscarPedidos}>Filtrar</button>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Nº Pedido</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Pagamento</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p._id}>
              <td>{p.numeroPedido}</td>
              <td>{p.cliente?.nome || "—"}</td>
              <td>R$ {p.total.toFixed(2)}</td>
              <td>{p.pagamento}</td>
              <td>{p.statusPagamento}</td>
              <td>
                {p.statusPagamento === "pendente" && (
                  <button onClick={() => confirmarPagamento(p._id)}>
                    Confirmar Pagamento
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
