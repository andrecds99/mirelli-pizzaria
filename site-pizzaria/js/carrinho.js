// ===============================
// CARRINHO - MIRELLI PIZZARIA
// ===============================

// Carregar carrinho do localStorage ao iniciar
if (!window.carrinho) {
  window.carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
}

// ===============================
// ATUALIZAR CARRINHO
// ===============================
function atualizarCarrinho() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItems) return;

  cartItems.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, i) => {
    total += item.preco * (item.quantidade || 1); // Considera quantidade

    const produto = item.produto || item;

    cartItems.innerHTML += `
      <div class="cart-item">
        <strong>${produto.nome}</strong><br>
        ${produto.sabores ? `🍕 ${produto.sabores}<br>` : ""}
        ${produto.tamanho ? `Tamanho: ${produto.tamanho}<br>` : ""}
        ${produto.borda ? `Borda: ${produto.borda}<br>` : ""}
        <small>R$ ${item.preco.toFixed(2)} x ${item.quantidade || 1}</small>
        <button onclick="removerItem(${i})">✖</button>
      </div>
    `;
  });

  cartCount.innerText = carrinho.length;
  cartTotal.innerText = total.toFixed(2);

  // Salvar no localStorage
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// ===============================
// REMOVER ITEM
// ===============================
function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

// ===============================
// ABRIR / FECHAR CARRINHO
// ===============================
function toggleCart() {
  const panel = document.getElementById("cartPanel");
  if (!panel) return;
  const isVisible = panel.style.display === "block";
  panel.style.display = isVisible ? "none" : "block";
}


// ===============================
// MENSAGEM UX (WHATS STYLE)
// ===============================
function mostrarMensagemCarrinho(texto) {
  const msg = document.createElement("div");
  msg.className = "cart-message";
  msg.innerText = texto;

  document.body.appendChild(msg);

  setTimeout(() => msg.classList.add("show"), 100);
  setTimeout(() => msg.classList.remove("show"), 3000);
  setTimeout(() => msg.remove(), 3500);
}

// ===============================
// SCROLL
// ===============================
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ===============================
// EVENTOS AUTOMÁTICOS
// ===============================
document.getElementById("pizzaTamanho")?.addEventListener("change", atualizarPreco);
document.getElementById("borda")?.addEventListener("change", atualizarPreco);

// ===============================
// FINALIZAR PEDIDO
// ===============================
function finalizarPedido() {
  const clienteStr = localStorage.getItem("clienteLogado");

  if (!clienteStr) {
    alert("Você precisa estar logado para finalizar o pedido.");
    return;
  }

  if (!Array.isArray(carrinho) || carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const cliente = JSON.parse(clienteStr);

  const pedido = {
    cliente,
    itens: carrinho,
    total: carrinho.reduce((s, i) => s + i.preco, 0)
  };

  localStorage.setItem("pedidoEmAndamento", JSON.stringify(pedido));
  window.location.href = "checkout.html";
}
