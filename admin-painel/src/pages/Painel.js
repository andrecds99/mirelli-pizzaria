// src/pages/Painel.js
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Conexão com Socket.IO
const socket = io(process.env.REACT_APP_SOCKET_URL, { transports: ["websocket"] });

function Painel() {
  // Estados do componente
  const [pedidos, setPedidos] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagamentoFilter, setPagamentoFilter] = useState("");
  const [relatorio, setRelatorio] = useState(null);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const navigate = useNavigate();

  // Logout do admin
  const logout = () => {
    localStorage.removeItem("tokenAdmin");
    localStorage.removeItem("adminNome");
    navigate("/login");
  };

  // Função para buscar pedidos do backend
  const fetchPedidos = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/adminPainel/pedidos`, {
        params: {
          status: statusFilter,
          pagamento: pagamentoFilter,
          periodo: "hoje"
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("tokenAdmin")}` }
      });
      setPedidos(res.data);
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    }
  };

  // Atualizar status de um pedido
  const mudarStatus = async (id, novoStatus) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/adminPainel/pedidos/${id}/status`,
        { status: novoStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("tokenAdmin")}` } }
      );
      fetchPedidos(); // Atualiza lista
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  // Fechar caixa e gerar relatório
  const fecharCaixa = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/adminPainel/fechar-caixa`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("tokenAdmin")}` } }
      );
      setRelatorio(res.data);
      alert("Caixa fechado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao fechar caixa");
    }
  };

  // useEffect para carregar pedidos e configurar Socket.IO
  useEffect(() => {
    fetchPedidos();

    socket.on("connect", () => {
      console.log("Conectado ao Socket.IO");
    });

    // Receber novo pedido em tempo real
    socket.on("new-order", (novoPedido) => {
      setPedidos((prev) => [novoPedido, ...prev]);
    });

    // Atualização de pedidos existente
    socket.on("update-order", () => {
      fetchPedidos();
    });

    return () => {
      socket.off("new-order");
      socket.off("update-order");
    };
  }, [statusFilter, pagamentoFilter]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Painel Administrativo</h1>

      {/* Botão Logout */}
      <button
        onClick={logout}
        style={{ marginBottom: 20, padding: "10px", background: "#f44336", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
      >
        Logout
      </button>

      {/* Botão Fechar Caixa */}
      <button
        onClick={fecharCaixa}
        style={{ marginBottom: 20, padding: "10px", background: "#2196F3", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
      >
        Fechar Caixa
      </button>

      {/* Filtros de status e pagamento */}
      <div style={{ marginBottom: 20 }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos Status</option>
          <option value="novo">Novo</option>
          <option value="em preparo">Em Preparo</option>
          <option value="pronto">Pronto</option>
          <option value="saiu">Saiu</option>
          <option value="entregue">Entregue</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <select value={pagamentoFilter} onChange={(e) => setPagamentoFilter(e.target.value)} style={{ marginLeft: 10 }}>
          <option value="">Todos Pagamentos</option>
          <option value="pix">PIX</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="debito">Débito</option>
          <option value="credito">Crédito</option>
        </select>
      </div>

      {/* Lista de pedidos */}
      <h3>Pedidos Recebidos</h3>
      {pedidos.length === 0 ? (
        <p>Nenhum pedido no momento.</p>
      ) : (
        pedidos.map((p) => (
          <div key={p._id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10, borderRadius: 8, background: "#fafafa" }}>
            <p><b>Número:</b> {p.numeroPedido}</p>
            <p><b>Cliente:</b> {p.cliente?.nome || "Anônimo"}</p>
            <p><b>Total:</b> R$ {p.total.toFixed(2)}</p>
            <p><b>Pagamento:</b> {p.pagamento}</p>
            <p><b>Status:</b> {p.statusPagamento}</p>

            {/* Alterar status */}
            <select value={p.statusPagamento} onChange={(e) => mudarStatus(p._id, e.target.value)} style={{ marginTop: 10 }}>
              <option value="novo">Novo</option>
              <option value="em preparo">Em Preparo</option>
              <option value="pronto">Pronto</option>
              <option value="saiu">Saiu</option>
              <option value="entregue">Entregue</option>
              <option value="cancelado">Cancelado</option>
            </select>

            {/* Botão visualizar detalhes do pedido */}
            <button
              onClick={() => setPedidoSelecionado(p)}
              style={{ marginLeft: 10, marginTop: 10, padding: "6px 10px", cursor: "pointer" }}
            >
              Detalhes
            </button>
          </div>
        ))
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

            {/* Botão de simulação de impressão */}
            <button
              onClick={() => {
                const printWindow = window.open("", "PrintWindow", "width=400,height=600");
                printWindow.document.write("<html><head><title>Pedido</title></head><body>");
                printWindow.document.write(`<h2>Pedido #${pedidoSelecionado.numeroPedido}</h2>`);
                printWindow.document.write(`<p><strong>Cliente:</strong> ${pedidoSelecionado.cliente?.nome || "Anônimo"}</p>`);
                printWindow.document.write(`<p><strong>Telefone:</strong> ${pedidoSelecionado.cliente?.telefone || "-"}</p>`);
                printWindow.document.write(`<p><strong>Endereço:</strong> ${pedidoSelecionado.cliente?.endereco || "-"}</p>`);
                printWindow.document.write("<h4>Itens:</h4><ul>");
                pedidoSelecionado.itens?.forEach(item => {
                  printWindow.document.write(`<li>${item.produto?.nome} — ${item.quantidade}x — R$ ${item.preco}</li>`);
                });
                printWindow.document.write("</ul>");
                printWindow.document.write(`<p><strong>Total:</strong> R$ ${pedidoSelecionado.total}</p>`);
                printWindow.document.write(`<p><strong>Pagamento:</strong> ${pedidoSelecionado.pagamento}</p>`);
                printWindow.document.write(`<p><strong>Status:</strong> ${pedidoSelecionado.statusPagamento}</p>`);
                printWindow.document.write("</body></html>");
                printWindow.document.close();
                printWindow.print();
              }}
              style={{
                marginTop: "10px",
                marginRight: "10px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Imprimir Pedido
            </button>

            {/* Botão fechar modal */}
            <button
              onClick={() => setPedidoSelecionado(null)}
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

      {/* Links para download de PDF/CSV do fechamento de caixa */}
      {relatorio && (
        <div style={{ marginTop: 20 }}>
          <a href={`${process.env.REACT_APP_API_URL}${relatorio.pdfPath}`} download>
            <button style={{ marginRight: 10 }}>Download PDF</button>
          </a>
          <a href={`${process.env.REACT_APP_API_URL}${relatorio.csvPath}`} download>
            <button>Download CSV</button>
          </a>
        </div>
      )}
    </div>
  );
}

export default Painel;
