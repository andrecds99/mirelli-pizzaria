import React, { useEffect, useState } from "react";
import api from "../api/api";
import { initSocket, disconnectSocket } from "../socket";
import RelatorioCaixa from "../components/RelatorioCaixa";

/* ===============================
   UTIL: COR DO PEDIDO POR TEMPO
================================ */
function getPedidoClass(pedido) {
  if (pedido.statusPedido === "entregue") return "pedido-entregue";
  if (pedido.statusPedido === "cancelado") return "pedido-cancelado";

  const criadoEm = new Date(pedido.dataPedido);
  const agora = new Date();
  const minutos = (agora - criadoEm) / 1000 / 60;

  if (minutos <= 10) return "pedido-ok";
  if (minutos <= 20) return "pedido-atencao";
  return "pedido-atrasado";
}

export default function Pedidos({ token, onLogout }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     SOCKET + LOAD INICIAL
  ================================ */
  useEffect(() => {
    const socket = initSocket(token);

    socket.on("new-order", pedido => {
      setPedidos(prev => [pedido, ...prev]);
    });

    carregarPedidos();

    return () => {
      socket.off("new-order");
      disconnectSocket();
    };
  }, [token]);

  /* ===============================
     ATUALIZA CORES A CADA 1 MIN
  ================================ */
  useEffect(() => {
    const timer = setInterval(() => {
      setPedidos(p => [...p]);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  async function carregarPedidos() {
    try {
      const res = await api.get("/adminPainel/pedidos");
      setPedidos(res.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     AÇÕES
  ================================ */
  async function atualizarStatusPedido(id, statusPedido) {
    try {
      await api.patch(`/adminPainel/pedidos/${id}/status`, {
        status: statusPedido
      });

      setPedidos(prev =>
        prev.map(p =>
          p._id === id ? { ...p, statusPedido } : p
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status");
    }
  }

  async function confirmarPagamento(id) {
    try {
      await api.post(`/adminPainel/pedidos/${id}/confirmar`);
      setPedidos(prev =>
        prev.map(p =>
          p._id === id ? { ...p, statusPagamento: "pago" } : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  function logout() {
    localStorage.removeItem("adminToken");
    disconnectSocket();
    onLogout();
  }

  /* ===============================
     RENDER
  ================================ */
  if (loading) return <p>Carregando pedidos...</p>;

  return (
    <div className="admin-container">
      {/* TOPO */}
      <header className="topbar">
        <h2>Painel Administrativo</h2>
        <button onClick={logout}>Logout</button>
      </header>

      {/* LISTA */}
      <div className="pedidos-lista">
        {pedidos.map(pedido => (
          <div
            key={pedido._id}
            className={`pedido-card ${getPedidoClass(pedido)}`}
          >
            <h3>Pedido #{pedido.numeroPedido}</h3>

            {/* CLIENTE */}
            <p><strong>Cliente:</strong> {pedido.clienteInfo?.nome}</p>
            <p><strong>Telefone:</strong> {pedido.clienteInfo?.telefone}</p>

            {/* ENTREGA */}
            <p>
              <strong>Entrega:</strong>{" "}
              {pedido.metodoEntrega === "retirada"
                ? "Retirada no balcão"
                : "Delivery"}
            </p>

            {pedido.metodoEntrega === "delivery" && pedido.endereco && (
              <p>
                <strong>Endereço:</strong>{" "}
                {pedido.endereco.logradouro}, {pedido.endereco.numero} -{" "}
                {pedido.endereco.bairro}
              </p>
            )}

            {/* ITENS */}
            <div className="itens">
              <strong>Itens:</strong>
              <ul>
                {pedido.itens.map((item, i) => (
                  <li key={i}>
                    🍕 {item.produto.nome}<br />
                    Tamanho: {item.produto.tamanho}<br />
                    Borda: {item.produto.borda}<br />
                    Obs: {item.produto.observacoes || "-"}<br />
                    Qtd: {item.quantidade} | R$ {item.preco.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>

            {/* PAGAMENTO */}
            <p><strong>Pagamento:</strong> {pedido.pagamento}</p>
            {pedido.pagamento === "dinheiro" && pedido.trocoPara && (
              <p><strong>Troco para:</strong> R$ {pedido.trocoPara}</p>
            )}

            <p>
              <strong>Status pagamento:</strong>{" "}
              <span>{pedido.statusPagamento}</span>
            </p>

            {pedido.statusPagamento === "pendente" && (
              <button onClick={() => confirmarPagamento(pedido._id)}>
                Confirmar pagamento
              </button>
            )}

            {/* STATUS PEDIDO */}
            <div className="status">
              <label>Status do pedido:</label>
              <select
                value={pedido.statusPedido}
                onChange={e =>
                  atualizarStatusPedido(pedido._id, e.target.value)
                }
              >
                <option value="novo">Novo</option>
                <option value="em preparo">Em preparo</option>
                <option value="pronto">Pronto</option>
                <option value="saiu">Saiu para entrega</option>
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* TOTAL */}
            <p className="total">
              <strong>Total:</strong> R$ {pedido.total.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* FECHAMENTO */}
      <RelatorioCaixa />
    </div>
  );
}
