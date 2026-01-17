/**
 * MENU - MIRELLI PIZZARIA
 */

const pizzas = [
  {id:1, category:'Pizzas Salgadas', name:'Arretada', description:'Calabresa moída, ovos, cebola e pimenta', price:52.00},
  {id:2, category:'Pizzas Salgadas', name:'Baiana', description:'Calabresa moída, ovos, cebola, pimenta e muçarela', price:54.00},
  {id:3, category:'Pizzas Salgadas', name:'Caipira', description:'Frango, milho e catupiry', price:54.00},
  {id:4, category:'Pizzas Doces', name:'Chocolate', description:'Creme de chocolate premium com granulado', price:50.00},
  {id:5, category:'Bebidas Sem Álcool', name:'Coca Cola 2L', description:'Refrigerante Coca Cola 2 litros', price:12.00},
  {id:6, category:'Bebidas Alcoólicas', name:'Cerveja 350ml', description:'Cerveja gelada 350ml', price:8.00}
];

let carrinho = [];
let pizzaSelecionada = null;
let primeiraMetade = null;
let esperandoSegundaMetade = false;

// === Renderiza o cardápio ===
function renderMenu(){
  const cardapio = document.getElementById('cardapio');
  cardapio.innerHTML = '';

  const categorias = [...new Set(pizzas.map(p => p.category))];
  categorias.forEach(cat => {
    const sec = document.createElement('div');
    sec.className = 'category';
    sec.id = cat.replace(/\s+/g, '-').toLowerCase();
    sec.innerHTML = `<h2>${cat}</h2>`;
    pizzas.filter(p => p.category === cat).forEach(p => {
      const div = document.createElement('div');
      div.className = 'pizza';
      div.innerHTML = `
        <div>
          <strong>${p.name}</strong>
          <p>${p.description}</p>
          <small>R$ ${p.price.toFixed(2)}</small>
        </div>
        <button onclick="abrirModal(${p.id})">Adicionar</button>
      `;
      sec.appendChild(div);
    });
    cardapio.appendChild(sec);
  });
}
renderMenu();

// === Abre o modal ===
function abrirModal(id) {
  pizzaSelecionada = pizzas.find(p => p.id === id);

  // Caso esteja esperando a segunda metade
  if (esperandoSegundaMetade && primeiraMetade) {
    adicionarSegundaMetade(pizzaSelecionada);
    return;
  }

  // Caso normal: abre o modal
  document.getElementById("modalPizzaNome").innerText = pizzaSelecionada.name;
  document.getElementById("modalPizzaDescricao").innerText = pizzaSelecionada.description;
  document.getElementById("modalPizzaPreco").innerText = pizzaSelecionada.price.toFixed(2);
  document.getElementById("pizzaTamanho").value = "normal";
  document.getElementById("opcoesBordaTamanho").style.display = "block";
  document.getElementById("modal").style.display = "block";

  removerSelecaoInteiraMetade();
  atualizarPreco();

  const botaoAdicionar = document.querySelector(".modal-buttons button:first-child");
  botaoAdicionar.disabled = true;
  botaoAdicionar.style.opacity = "0.5";
  botaoAdicionar.style.cursor = "not-allowed";
}

// === Fecha o modal ===
function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

// === Atualiza preço conforme tamanho ===
function atualizarPreco() {
  if (!pizzaSelecionada) return;
  let preco = pizzaSelecionada.price;
  const tamanho = document.getElementById("pizzaTamanho").value;
  if (tamanho === "broto") preco -= 20;
  if (tamanho === "gigante") preco += 30;
  document.getElementById("precoFinal").innerText = preco.toFixed(2);
}

// === Seleção de Inteira / Metade ===
function removerSelecaoInteiraMetade(){
  document.querySelectorAll("#opcaoInteiraMeia button").forEach(btn => {
    btn.style.background = "";
    btn.style.color = "";
    btn.classList.remove("ativo");
  });
}

function selecionarInteira() {
  removerSelecaoInteiraMetade();
  const botao = document.querySelector("#opcaoInteiraMeia button:nth-child(1)");
  botao.classList.add("ativo");
  botao.style.background = "#8B0000";
  botao.style.color = "#fff";

  esperandoSegundaMetade = false;
  primeiraMetade = null;

  // Habilita botão de adicionar
  const botaoAdicionar = document.querySelector(".modal-buttons button:first-child");
  botaoAdicionar.disabled = false;
  botaoAdicionar.style.opacity = "1";
  botaoAdicionar.style.cursor = "pointer";
}

function selecionarMeia() {
  removerSelecaoInteiraMetade();
  const botao = document.querySelector("#opcaoInteiraMeia button:nth-child(2)");
  botao.classList.add("ativo");
  botao.style.background = "#8B0000";
  botao.style.color = "#fff";

  primeiraMetade = pizzaSelecionada;
  esperandoSegundaMetade = true;

  fecharModal();
  mostrarMensagemCarrinho("🍕 Falta escolher a outra metade da pizza!");
}

// === Adiciona a segunda metade ===
function adicionarSegundaMetade(pizza) {
  const tamanho = document.getElementById("pizzaTamanho").value || "normal";
  const borda = document.getElementById("borda").value || "sem";

  // preço médio das duas metades
  const preco = ((primeiraMetade.price + pizza.price) / 2).toFixed(2);

  carrinho.push({
    nome: `${primeiraMetade.name} / ${pizza.name} (Metade a Metade)`,
    tamanho,
    borda,
    preco: parseFloat(preco)
  });

  esperandoSegundaMetade = false;
  primeiraMetade = null;

  atualizarCarrinho();
  mostrarMensagemCarrinho("✅ Pizza metade a metade adicionada ao carrinho!");
}

// === Adiciona pizza ao carrinho ===
function adicionarPizzaAoCarrinho() {
  const tamanho = document.getElementById("pizzaTamanho").value;
  const borda = document.getElementById("borda").value;
  const preco = parseFloat(document.getElementById("precoFinal").innerText);

  if (!pizzaSelecionada) return;

  carrinho.push({
    nome: pizzaSelecionada.name,
    tamanho,
    borda,
    preco
  });

  atualizarCarrinho();
  fecharModal();
}