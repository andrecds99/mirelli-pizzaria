// src/pages/PainelAdmin.js
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PainelAdmin() {
  const [pedidos, setPedidos] = useState([]); // Lista de pedidos
  const [carregando, setCarregando] = useState(true); // Estado de carregamento
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null); // Para o modal de detalhes
  const [filtroStatus, setFiltroStatus] = useState(""); // Filtro por status


  // Função para buscar pedidos do backend
  const carregarPedidos = async () => {
    try {
      setCarregando(true);
      const token = localStorage.getItem("tokenAdmin"); // Token do admin
      const res = await axios.get("http://localhost:5000/api/admin/pedidos", {
        headers: { Authorization: `Bearer ${token}` },
        params: filtroStatus ? { status: filtroStatus } : {},
      });
      setPedidos(res.data);
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    } finally {
      setCarregando(false);
    }
  };

  // Carrega pedidos ao iniciar e quando mudar o filtro
  useEffect(() => {
    carregarPedidos();
  }, [filtroStatus]);

  // Função para confirmar pagamento (status = pago)
  const confirmarPagamento = async (id) => {
    try {
      const token = localStorage.getItem("tokenAdmin");
      await axios.post(
        `http://localhost:5000/api/admin/pedidos/${id}/confirmar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Pagamento confirmado!");
      carregarPedidos(); // Atualiza a lista
    } catch (err) {
      alert("Erro ao confirmar pagamento!");
      console.error(err);
    }
  };

  // Função para exibir detalhes do pedido
  const abrirDetalhes = (pedido) => setPedidoSelecionado(pedido);

  // Função para fechar modal
  const fecharModal = () => setPedidoSelecionado(null);

  // Interface principal
  return (
    <div style={{ padding: "20px" }}>
      <h2>Painel Administrativo</h2>

      {/* Filtro de status */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Filtrar por status:{" "}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </select>
        </label>
      </div>

      {/* Tabela de pedidos */}
      {carregando ? (
        <p>Carregando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <table border="1" width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Pagamento</th>
              <th>Status</th>
              <th>Total (R$)</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p._id}>
                <td>{p.cliente?.nome || "—"}</td>
                <td>{p.pagamento}</td>
                <td>{p.statusPagamento}</td>
                <td>{p.total.toFixed(2)}</td>
                <td>{new Date(p.dataPedido).toLocaleString()}</td>
                <td>
                  <button onClick={() => abrirDetalhes(p)}>Ver Detalhes</button>{" "}
                  {p.statusPagamento !== "pago" && (
                    <button onClick={() => confirmarPagamento(p._id)}>
                      Confirmar Pagamento
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Detalhes do Pedido */}
      {pedidoSelecionado && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              width: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3>Detalhes do Pedido</h3>
            <p><strong>Cliente:</strong> {pedidoSelecionado.cliente?.nome}</p>
            <p><strong>Telefone:</strong> {pedidoSelecionado.cliente?.telefone}</p>
            <p><strong>Endereço:</strong> {pedidoSelecionado.cliente?.endereco}</p>

            <h4>Itens:</h4>
            <ul>
              {pedidoSelecionado.itens?.map((item, i) => (
                <li key={i}>
                  {item.produto?.nome} — {item.quantidade}x — R$ {item.preco}
                </li>
              ))}
            </ul>

            <p><strong>Pagamento:</strong> {pedidoSelecionado.pagamento}</p>
            <p><strong>Status:</strong> {pedidoSelecionado.statusPagamento}</p>
            <p><strong>Total:</strong> R$ {pedidoSelecionado.total}</p>
            <p><strong>Data:</strong> {new Date(pedidoSelecionado.dataPedido).toLocaleString()}</p>

            {/* Botão para fechar modal */}
            <button
              onClick={fecharModal}
              style={{
                marginTop: "10px",
                background: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
