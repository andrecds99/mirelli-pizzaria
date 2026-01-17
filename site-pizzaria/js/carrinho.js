
  
  // === Atualiza carrinho ===
  function atualizarCarrinho() {
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");
  
    cartItems.innerHTML = '';
    let total = 0;
  
    carrinho.forEach((item, i) => {
      total += item.preco;
      cartItems.innerHTML += `<div class="cart-item">
        ${item.nome} (${item.tamanho}) - R$ ${item.preco.toFixed(2)}
        <button onclick="removerItem(${i})">✖</button>
      </div>`;
    });
  
    cartCount.innerText = carrinho.length;
    cartTotal.innerText = total.toFixed(2);
  }
  
  // === Remove item ===
  function removerItem(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
  }
  
  // === Alterna painel do carrinho ===
  function toggleCart() {
    const panel = document.getElementById('cartPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  }
  
  // === Mensagem estilo WhatsApp ===
  function mostrarMensagemCarrinho(texto) {
    let msg = document.createElement("div");
    msg.className = "cart-message";
    msg.innerText = texto;
    document.body.appendChild(msg);
  
    setTimeout(() => { msg.classList.add("show"); }, 100);
    setTimeout(() => { msg.classList.remove("show"); }, 3000);
    setTimeout(() => { msg.remove(); }, 3500);
  }
  
  // === Navegação ===
  function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({behavior: "smooth"});
  }
  
  // === Eventos automáticos ===
  document.getElementById("pizzaTamanho").addEventListener("change", atualizarPreco);
  document.getElementById("borda").addEventListener("change", atualizarPreco);
  
  // ===============================
// FINALIZAR PEDIDO
// ===============================
function finalizarPedido() {
  console.log("🛒 Finalizar pedido clicado");

  const clienteStr = localStorage.getItem("clienteLogado");
  if (!clienteStr) {
    alert("Você precisa estar logado para finalizar o pedido.");
    return;
  }

  const cliente = JSON.parse(clienteStr);

  if (!Array.isArray(carrinho) || carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const pedido = {
    cliente,
    itens: carrinho,
    total: carrinho.reduce((s, i) => s + i.preco, 0)
  };

  localStorage.setItem("pedidoEmAndamento", JSON.stringify(pedido));

  // ✅ agora VAI redirecionar
  window.location.href = "checkout.html";
}