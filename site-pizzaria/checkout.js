document.addEventListener("DOMContentLoaded", () => {
  const pedido = JSON.parse(localStorage.getItem("pedidoEmAndamento"));
  const cliente = JSON.parse(localStorage.getItem("clienteLogado"));

  if (!pedido || !cliente) {
    alert("Sessão expirada.");
    window.location.href = "index.html";
    return;
  }

  const pagamentoSelect = document.getElementById("pagamento");
  const blocoTroco = document.getElementById("blocoTroco");

  pagamentoSelect.addEventListener("change", () => {
    blocoTroco.style.display =
      pagamentoSelect.value === "dinheiro" ? "block" : "none";
  });

  // ===============================
  // RESUMO DO PEDIDO
  // ===============================
  const resumo = document.getElementById("resumoPedido");
  let total = 0;

  pedido.itens.forEach((item, index) => {
    total += item.preco;

    resumo.innerHTML += `
      <div class="item">
        <strong>${item.nome}</strong><br>
        Tamanho: ${item.tamanho}<br>
        Borda: ${item.borda}<br>
        Preço: R$ ${item.preco.toFixed(2)}<br>
        <textarea data-index="${index}"
          placeholder="Ex: sem cebola, massa bem assada"></textarea>
      </div>
    `;
  });

  resumo.innerHTML += `<h3>Total: R$ ${total.toFixed(2)}</h3>`;

  document.getElementById("enderecoCadastrado").innerText =
    cliente.endereco || "Nenhum endereço cadastrado";
});

// ===============================
// CONFIRMAR PEDIDO
// ===============================
async function confirmarPedido() {
  try {
    const pedido = JSON.parse(localStorage.getItem("pedidoEmAndamento"));
    const cliente = JSON.parse(localStorage.getItem("clienteLogado"));
    const token = localStorage.getItem("token"); // 🔑 token usado pelo middleware

    if (!pedido || !cliente || !token) {
      alert("Sessão expirada.");
      return;
    }

    // Observações por item
    document.querySelectorAll("textarea[data-index]").forEach(t => {
      pedido.itens[t.dataset.index].observacao = t.value;
    });

    const pagamento = document.getElementById("pagamento").value;
    if (!pagamento) {
      alert("Selecione a forma de pagamento");
      return;
    }

    let trocoPara = null;
    if (pagamento === "dinheiro") {
      trocoPara = Number(document.getElementById("trocoPara").value);
      if (!trocoPara || trocoPara <= 0) {
        alert("Informe o valor para troco");
        return;
      }
    }

    const payload = {
      itens: pedido.itens.map(item => ({
        produto: {
          nome: item.nome,
          sabor: item.sabor || null,
          meioASabor: item.meioASabor || null,
          tamanho: item.tamanho,
          borda: item.borda,
          observacoes: item.observacao || ""
        },
        quantidade: item.quantidade || 1,
        preco: item.preco
      })),
    
      total: pedido.itens.reduce((s, i) => s + i.preco, 0),
    
      pagamento,
    
      telefone: cliente.telefone, // ⚠️ obrigatório
    
      endereco: {                 // ⚠️ TEM que ser objeto
        tipo: "cadastrado",
        logradouro: cliente.endereco.logradouro || "",
        numero: cliente.endereco.numero || "",
        bairro: cliente.endereco.bairro || "",
        cidade: cliente.endereco.cidade || "",
        cep: cliente.endereco.cep || "",
        observacoes: ""
      },
    
      metodoEntrega: "delivery",
      trocoPara
    };
    
    console.log("PAYLOAD ENVIADO:", payload);
    const res = await fetch("http://localhost:5000/api/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Idempotency-Key": crypto.randomUUID()
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    const data = await res.json();
    console.log("✅ Pedido enviado:", data);

    localStorage.removeItem("pedidoEmAndamento");
    alert("Pedido realizado com sucesso!");
    window.location.href = "pedido-sucesso.html";

  } catch (err) {
    console.error("Erro no envio:", err);
    alert("Erro ao enviar pedido.");
  }
}
