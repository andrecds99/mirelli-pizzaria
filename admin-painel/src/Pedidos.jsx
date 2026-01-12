// src/pages/Pedidos.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { initSocket, disconnectSocket } from "../socket";
import RelatorioCaixa from "../components/RelatorioCaixa";

export default function Pedidos({ token, onLogout }) {
  const [pedidos, setPedidos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // inicia socket com token (autenticação opcional no backend)
    const socket = initSocket(token);

    socket.on("new-order", (pedido) => {
      // insere no topo
      setPedidos(prev => [pedido, ...prev]);
    });

    // buscar pedidos iniciais
    buscarPedidos();

    return () => {
      socket.off("new-order");
      disconnectSocket();
    };
    // eslint-disable-next-line
  }, []);

  async function buscarPedidos() {
    setLoading(true);
    try {
      const res = await api.get(`/adminPainel/pedidos${filtroStatus ? ("?status=" + filtroStatus) : ""}`);
      setPedidos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function confirmarPagamento(id) {
    try {
      await api.post(`/adminPainel/pedidos/${id}/confirmar`);
      setPedidos(prev => prev.map(p => p._id === id ? { ...p, statusPagamento: "pago" } : p));
    } catch (err) {
      console.error(err);
      alert("Erro ao confirmar pagamento");
    }
  }

  async function handleLogout() {
    localStorage.removeItem("adminToken");
    disconnectSocket();
    onLogout();
  }

  return (
    <div className="admin-container">
      <div className="topbar">
        <h2>Painel Administrativo</h2>
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="controls">
        <label>Filtro status:</label>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
        </select>
        <button onClick={buscarPedidos}>Buscar</button>
      </div>

      <div className="table-wrap">
        {loading ? <p>Carregando...</p> :
        <table>
          <thead>
            <tr>
              <th>Nº</th><th>Cliente</th><th>Telefone</th><th>Itens</th><th>Total</th><th>Pagamento</th><th>Status</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p._id}>
                <td>{p.numeroPedido}</td>
                <td>{p.cliente?.nome || "-"}</td>
                <td>{p.telefone}</td>
                <td>{p.itens.map(i => `${i.produto} x${i.quantidade}`).join(", ")}</td>
                <td>R$ {p.total.toFixed(2)}</td>
                <td>{p.pagamento}</td>
                <td>{p.statusPagamento}</td>
                <td>
                  {p.pagamento === "pix" && p.statusPagamento === "pendente" && (
                    <button onClick={() => confirmarPagamento(p._id)}>Confirmar PIX</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        }
      </div>

      <RelatorioCaixa />
    </div>
  );
}
