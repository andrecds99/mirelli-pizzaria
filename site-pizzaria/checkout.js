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

        ${produto.sabores ? `🍕 ${produto.sabores}<br>` : ""}
        ${produto.tamanho ? `Tamanho: ${produto.tamanho}<br>` : ""}
        ${produto.borda ? `Borda: ${produto.borda}<br>` : ""}

        Quantidade: ${item.quantidade || 1}<br>
        Preço: R$ ${item.preco.toFixed(2)}

        <textarea
          data-index="${index}"
          placeholder="Observações deste item (opcional)"
        ></textarea>
      </div>
    `;
  });

  resumo.innerHTML += `<h3>Total estimado: R$ ${total.toFixed(2)}</h3>`;

  // ===============================
  // INFO TAXA (SÓ VISUAL)
  // ===============================
  const taxaInfo = document.getElementById("taxaEntregaInfo");
  taxaInfo.innerText =
    "🚚 A taxa de entrega será confirmada após análise do endereço";

  // ===============================
  // ENDEREÇO VISUAL
  // ===============================
  document.getElementById("enderecoCadastrado").innerText =
    cliente.endereco
      ? `${cliente.endereco}, ${cliente.numero} - ${cliente.bairro}`
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
  // PAGAMENTO
  // ===============================
  const pagamentoSelect = document.getElementById("pagamento");
  const blocoTroco = document.getElementById("blocoTroco");
  const pixInfo = document.getElementById("pixInfo");

  pagamentoSelect.addEventListener("change", () => {
    blocoTroco.style.display =
      pagamentoSelect.value === "dinheiro" ? "block" : "none";
    pixInfo.style.display =
      pagamentoSelect.value === "pix" ? "block" : "none";
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

    // OBS POR ITEM
    document.querySelectorAll("textarea[data-index]").forEach(t => {
      pedido.itens[t.dataset.index].observacoes = t.value;
    });

    const pagamento = document.getElementById("pagamento").value;
    if (!pagamento) {
      alert("Selecione a forma de pagamento");
      return;
    }

    let trocoPara = null;
    if (pagamento === "dinheiro") {
      trocoPara = Number(document.getElementById("trocoPara").value);
      if (!trocoPara) {
        alert("Informe o valor para troco");
        return;
      }
    }

    // ENDEREÇO
    let endereco;
    if (document.getElementById("usarEnderecoAlternativo").checked) {
      endereco = {
        logradouro: altLogradouro.value,
        numero: altNumero.value,
        bairro: altBairro.value,
        cidade: altCidade.value,
        cep: altCep.value,
        observacoes: altObs.value || ""
      };
    } else {
      endereco = {
        logradouro: cliente.endereco || "",
        numero: cliente.numero || "",
        bairro: cliente.bairro || "",
        cidade: cliente.cidade || "",
        cep: cliente.cep || "",
        observacoes:
          document.getElementById("obsEntregaCadastrado")?.value || ""
      };
    }

    // PAYLOAD FINAL (SEM TAXA)
    const payload = {
      itens: pedido.itens.map(item => ({
        produto: {
          nome: item.produto?.nome || item.nome,
          sabores: item.produto?.sabores || null,
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

    const res = await fetch("http://mirelli-api.onrender.com/api/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": crypto.randomUUID()
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(await res.text());

    localStorage.removeItem("pedidoEmAndamento");
    alert("Pedido enviado! Aguarde confirmação da entrega.");
    window.location.href = "pedido-sucesso.html";

  } catch (err) {
    console.error(err);
    alert("Erro ao enviar pedido.");
  }
}
