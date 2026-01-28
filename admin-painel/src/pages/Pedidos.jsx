import React, { useEffect, useState } from "react";
import api from "../api/api";
import { initSocket, disconnectSocket } from "../socket";
import RelatorioCaixa from "../components/RelatorioCaixa";
import PrintPedido from "../components/PrintPedido";

/* ===============================
   COR DO PEDIDO POR TEMPO
================================ */
function getPedidoClass(pedido) {
  if (pedido.statusPedido === "concluido") return "pedido-entregue";
  if (pedido.statusPedido === "cancelado") return "pedido-cancelado";

  const criadoEm = new Date(pedido.dataPedido);
  const agora = new Date();
  const minutos = (agora - criadoEm) / 1000 / 60;

  if (minutos <= 10) return "pedido-ok";
  if (minutos <= 20) return "pedido-atencao";
  return "pedido-atrasado";
}

/* ===============================
   FLUXO DE STATUS
================================ */
const fluxoStatus = {
  novo: ["em preparo", "cancelado"],
  "em preparo": ["saiu", "cancelado"],
  saiu: ["concluido", "cancelado"],
  concluido: [],
  cancelado: []
};


export default function Pedidos({ token, onLogout }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState("ativos");

  /* ===============================
     SOCKET + LOAD
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
     ATUALIZA CORES
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
    } catch {
      alert("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     FILTRO POR ABAS
  ================================ */
  const pedidosFiltrados = pedidos.filter(p => {
    if (aba === "ativos") {
      return !["concluido", "cancelado"].includes(p.statusPedido);
    }
    if (aba === "concluidos") {
      return p.statusPedido === "concluido";
    }
    if (aba === "cancelados") {
      return p.statusPedido === "cancelado";
    }
    return true;
  });
  

  /* ===============================
     AÇÕES
  ================================ */


  async function atualizarStatusPedido(id, novoStatus) {
    const pedidoAtual = pedidos.find(p => p._id === id);
    if (!pedidoAtual) return;
  
    if (!fluxoStatus[pedidoAtual.statusPedido].includes(novoStatus)) {
      alert("Fluxo de status inválido");
      return;
    }
  
    try {
      const res = await api.patch(`/adminPainel/pedidos/${id}/status`, {
        status: novoStatus
      });
  
      const pedidoAtualizado = res.data.pedido;
  
      setPedidos(prev =>
        prev.map(p =>
          p._id === id ? pedidoAtualizado : p
        )
      );
    } catch {
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
    } catch {
      alert("Erro ao confirmar pagamento");
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
      <header className="topbar">
        <h2>Painel Administrativo</h2>
        <button onClick={logout}>Logout</button>
      </header>

      {/* ABAS */}
      <div className="controls">
        <button onClick={() => setAba("ativos")}>🟢 Ativos</button>
        <button onClick={() => setAba("concluidos")}>✅ Concluídos</button>
        <button onClick={() => setAba("cancelados")}>❌ Cancelados</button>
      </div>

      <div className="pedidos-lista">
      {pedidosFiltrados.map(pedido => (
          <div key={pedido._id} className={`pedido-card ${getPedidoClass(pedido)}`}>
            <h3>Pedido #{pedido.numeroPedido}</h3>

            <p><strong>Cliente:</strong> {pedido.clienteInfo?.nome}</p>
            <p><strong>Telefone:</strong> {pedido.clienteInfo?.telefone}</p>

            {pedido.endereco && (
              <p>
                <strong>Endereço:</strong>{" "}
                {pedido.endereco.logradouro}, {pedido.endereco.numero}
              </p>
            )}

            <ul>
              {pedido.itens.map((item, i) => {
                const produto = item.produto || item;
                return (
                  <li key={i}>
                    🍕 {produto.nome}<br />
                    Tam: {produto.tamanho || item.tamanho || "-"} | 
                    Borda: {produto.borda || item.borda || "-"}<br />
                    Obs: {produto.observacoes || "-"}<br />
                    Qtd: {item.quantidade} | R$ {item.preco.toFixed(2)}
                  </li>
                );
              })}
            </ul>

            <p><strong>Pagamento:</strong> {pedido.pagamento}</p>

            {/* ===== TAXA DE ENTREGA ===== */}
            {pedido.metodoEntrega === "delivery" && (
              <div style={{ marginTop: "6px" }}>
                <p>
                  <strong>Taxa de entrega:</strong>{" "}
                  {pedido.taxaEntrega?.status === "pendente" ? (
                    <span style={{ color: "red", fontWeight: "bold" }}>
                      ⚠️ PENDENTE (ligar para o cliente)
                    </span>
                  ) : (
                    `R$ ${pedido.taxaEntrega?.valor.toFixed(2)}`
                  )}
                </p>
                  
                {/* INPUT PARA DEFINIR TAXA */}
                {pedido.taxaEntrega?.status === "pendente" && (
                  <input
                    type="number"
                    placeholder="Definir taxa (R$)"
                    style={{ width: "140px", marginTop: "4px" }}
                    onKeyDown={async e => {
                      if (e.key === "Enter") {
                        const valor = Number(e.target.value);
                      
                        if (isNaN(valor) || valor < 0) {
                          alert("Valor inválido");
                          return;
                        }
                      
                        try {
                          const res = await api.patch(
                            `/adminPainel/pedidos/${pedido._id}/taxa-entrega`,
                            { valor }
                          );
                          
                          setPedidos(prev =>
                            prev.map(p =>
                              p._id === pedido._id ? res.data.pedido : p
                            )
                          );
                            
                          e.target.value = "";
                        } catch {
                          alert("Erro ao definir taxa");
                        }
                      }
                    }}
                  />
                )}
              </div>
            )}
            

            {pedido.statusPagamento === "pendente" && (
              <button onClick={() => confirmarPagamento(pedido._id)}>
                Confirmar pagamento
              </button>
            )}

            <select
              value={pedido.statusPedido}
              onChange={e =>
                atualizarStatusPedido(pedido._id, e.target.value)
              }
            >
              <option value={pedido.statusPedido}>
                {pedido.statusPedido}
              </option>

              {fluxoStatus[pedido.statusPedido].map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <p><strong>Total:</strong> R$ {pedido.total.toFixed(2)}</p>

            <PrintPedido pedido={pedido} />
          </div>
        ))}
      </div>

      {/* CAIXA → SÓ PEDIDOS PAGOS */}
      <RelatorioCaixa pedidos={pedidos.filter(p => p.statusPagamento === "pago")} />
    </div>
  );
}
