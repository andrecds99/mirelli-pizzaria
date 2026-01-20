document.addEventListener("DOMContentLoaded", () => {
  const pedido = JSON.parse(localStorage.getItem("pedidoEmAndamento"));
  const cliente = JSON.parse(localStorage.getItem("clienteLogado"));

  if (!pedido || !cliente) {
    alert("Sessão expirada.");
    window.location.href = "index.html";
    return;
  }

  const resumo = document.getElementById("resumoPedido");
  let total = 0;

  // ===============================
  // RESUMO DO PEDIDO
  // ===============================
  pedido.itens.forEach((item, index) => {
    const produto = item.produto || item;
    total += item.preco;

    resumo.innerHTML += `
      <div class="item">
        <strong>${produto.nome}</strong><br>

        ${produto.tamanho ? `Tamanho: ${produto.tamanho}<br>` : ""}
        ${produto.borda ? `Borda: ${produto.borda}<br>` : ""}
        ${produto.sabor ? `Sabor: ${produto.sabor}<br>` : ""}
        ${produto.meioASabor ? `Meio a meio: ${produto.meioASabor}<br>` : ""}

        Quantidade: ${item.quantidade || 1}<br>
        Preço: R$ ${item.preco.toFixed(2)}

        <textarea
          data-index="${index}"
          placeholder="Observações desta pizza (opcional)"
        ></textarea>
      </div>
    `;
  });

  resumo.innerHTML += `<h3>Total: R$ ${total.toFixed(2)}</h3>`;

  // ===============================
  // ENDEREÇO CADASTRADO (VISUAL)
  // ===============================
  const enderecoEl = document.getElementById("enderecoCadastrado");
  enderecoEl.innerText = cliente.endereco
    ? cliente.endereco
    : "Nenhum endereço cadastrado";

  // ===============================
  // ENDEREÇO ALTERNATIVO
  // ===============================
  const chkAlt = document.getElementById("usarEnderecoAlternativo");
  const blocoAlt = document.getElementById("enderecoAlternativo");

  chkAlt.addEventListener("change", () => {
    blocoAlt.style.display = chkAlt.checked ? "block" : "none";
  });

  // ===============================
  // PAGAMENTO → TROCO
  // ===============================
  const pagamentoSelect = document.getElementById("pagamento");
  const blocoTroco = document.getElementById("blocoTroco");

  pagamentoSelect.addEventListener("change", () => {
    blocoTroco.style.display =
      pagamentoSelect.value === "dinheiro" ? "block" : "none";
  });
});

// ===============================
// CONFIRMAR PEDIDO
// ===============================
async function confirmarPedido() {
  try {
    const pedido = JSON.parse(localStorage.getItem("pedidoEmAndamento"));
    const cliente = JSON.parse(localStorage.getItem("clienteLogado"));
    const token = localStorage.getItem("token");

    if (!pedido || !cliente || !token) {
      alert("Sessão expirada.");
      return;
    }

    // ===============================
    // OBSERVAÇÕES POR ITEM
    // ===============================
    document.querySelectorAll("textarea[data-index]").forEach(t => {
      pedido.itens[t.dataset.index].observacoes = t.value;
    });

    // ===============================
    // PAGAMENTO
    // ===============================
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

    // ===============================
    // ENDEREÇO
    // ===============================
    let endereco;

    if (document.getElementById("usarEnderecoAlternativo").checked) {
      endereco = {
        tipo: "alternativo",
        logradouro: document.getElementById("altLogradouro").value,
        numero: document.getElementById("altNumero").value,
        bairro: document.getElementById("altBairro").value,
        cidade: document.getElementById("altCidade").value,
        cep: document.getElementById("altCep").value,
        observacoes: document.getElementById("altObs").value || ""
      };
    } else {
      endereco = {
        tipo: "cadastrado",
        logradouro: cliente.endereco || ""
      };
    }

    // ===============================
    // PAYLOAD FINAL
    // ===============================
    const payload = {
      itens: pedido.itens.map(item => ({
        produto: {
          nome: item.produto?.nome || item.nome,
          sabor: item.produto?.sabor || null,
          meioASabor: item.produto?.meioASabor || null,
          tamanho: item.produto?.tamanho || null,
          borda: item.produto?.borda || null,
          observacoes: item.observacoes || ""
        },
        quantidade: item.quantidade || 1,
        preco: item.preco
      })),

      total: pedido.itens.reduce((s, i) => s + i.preco, 0),
      pagamento,
      trocoPara,
      endereco,
      metodoEntrega: "delivery",
      telefone: cliente.telefone
    };

    console.log("📦 PAYLOAD:", payload);

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
      throw new Error(await res.text());
    }

    localStorage.removeItem("pedidoEmAndamento");
    alert("Pedido realizado com sucesso!");
    window.location.href = "pedido-sucesso.html";

  } catch (err) {
    console.error("Erro ao enviar pedido:", err);
    alert("Erro ao enviar pedido.");
  }
}
