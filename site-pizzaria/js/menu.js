/**
 * MENU - MIRELLI PIZZARIA 
 */

const produtos = [
  // PIZZAS SALGADAS
  { id: 1, categoria: "pizzas-salgadas", tipo: "pizza", nome: "Arretada", descricao: "Calabresa moída, ovos, cebola e pimenta", preco: 52 },
  { id: 2, categoria: "pizzas-salgadas", tipo: "pizza", nome: "Baiana", descricao: "Calabresa moída, ovos, cebola, pimenta e muçarela", preco: 54 },
  { id: 3, categoria: "pizzas-salgadas", tipo: "pizza", nome: "Caipira", descricao: "Frango, milho e catupiry", preco: 54 },

  // PIZZAS DOCES
  { id: 4, categoria: "pizzas-doces", tipo: "pizza", nome: "Chocolate", descricao: "Creme de chocolate premium com granulado", preco: 50 },

  // BEBIDAS
  { id: 5, categoria: "bebidas-sem-alcool", tipo: "bebida", nome: "Coca-Cola 2L", descricao: "Refrigerante 2 litros", preco: 12 },
  { id: 6, categoria: "bebidas-alcoolicas", tipo: "bebida", nome: "Cerveja 350ml", descricao: "Cerveja gelada", preco: 8 }
];

let produtoSelecionado = null;
let primeiraMetade = null;
let aguardandoSegundaMetade = false;
let tamanhoSelecionado = null;
let bordaSelecionada = null;

// ===============================
// RENDERIZA MENU
// ===============================
function renderMenu() {
  const cardapio = document.getElementById("cardapio");
  cardapio.innerHTML = "";

  const categorias = [...new Set(produtos.map(p => p.categoria))];

  categorias.forEach(cat => {
    const sec = document.createElement("div");
    sec.className = "category";
    sec.id = cat;

    sec.innerHTML = `<h2>${formatarTitulo(cat)}</h2>`;

    produtos
      .filter(p => p.categoria === cat)
      .forEach(p => {
        const div = document.createElement("div");
        div.className = "pizza";
        div.innerHTML = `
          <div>
            <strong>${p.nome}</strong>
            <p>${p.descricao}</p>
            <small>R$ ${p.preco.toFixed(2)}</small>
          </div>
          <button onclick="clicarProduto(${p.id})">Adicionar</button>
        `;
        sec.appendChild(div);
      });

    cardapio.appendChild(sec);
  });
}

function formatarTitulo(cat) {
  return cat.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

renderMenu();

// ===============================
// CLIQUE NO PRODUTO (ATUALIZADO)
// ===============================
function clicarProduto(id) {
  produtoSelecionado = produtos.find(p => p.id === id);

  if (produtoSelecionado.tipo === "bebida") {
    carrinho.push({
      produto: { nome: produtoSelecionado.nome },
      preco: produtoSelecionado.preco,
      quantidade: 1
    });
    atualizarCarrinho();
    mostrarMensagemCarrinho("🥤 Bebida adicionada ao carrinho!");
    return;
  }


  if (aguardandoSegundaMetade && primeiraMetade) {
    // Tratar como segunda metade
    const segundaMetade = {
      nome: produtoSelecionado.nome,
      preco: produtoSelecionado.preco
    };

    const precoFinal = Math.max(primeiraMetade.preco, segundaMetade.preco);

    carrinho.push({
      produto: {
        nome: `Meia ${primeiraMetade.nome} / Meia ${segundaMetade.nome}`,
        tamanho: tamanhoSelecionado,
        borda: bordaSelecionada
      },
      preco: precoFinal,
      quantidade: 1
    });

    // Resetar flags
    aguardandoSegundaMetade = false;
    primeiraMetade = null;
    tamanhoSelecionado = null;
    bordaSelecionada = null;

    atualizarCarrinho();
    mostrarMensagemCarrinho("🍕 Pizza meio a meio adicionada ao carrinho!");
    return;
  }

  
  abrirModalPizza();
}

// ===============================
// ADICIONAR AO CARRINHO 
// ===============================
function adicionarPizzaAoCarrinho() {
  const tamanho = document.getElementById("pizzaTamanho").value;
  const borda = document.getElementById("borda").value;
  const precoAtual = produtoSelecionado.preco;

  // PRIMEIRA METADE (mantém igual)
  if (aguardandoSegundaMetade && !primeiraMetade) {
    primeiraMetade = {
      nome: produtoSelecionado.nome,
      preco: precoAtual
    };
    tamanhoSelecionado = tamanho;
    bordaSelecionada = borda;

    fecharModal();
    mostrarMensagemCarrinho("🍕 Falta selecionar a outra metade da pizza!");
    return;
  }

  // PIZZA INTEIRA (mantém igual)
  carrinho.push({
    produto: {
      nome: produtoSelecionado.nome,
      tamanho,
      borda
    },
    preco: precoAtual,
    quantidade: 1
  });

  atualizarCarrinho();
  fecharModal();
  mostrarMensagemCarrinho("🍕 Pizza adicionada ao carrinho!");
}

// ===============================
// MODAL PIZZA
// ===============================
function abrirModalPizza() {
  document.getElementById("modalPizzaNome").innerText = produtoSelecionado.nome;
  document.getElementById("modalPizzaDescricao").innerText = produtoSelecionado.descricao;
  document.getElementById("modalPizzaPreco").innerText = produtoSelecionado.preco.toFixed(2);
  document.getElementById("precoFinal").innerText = produtoSelecionado.preco.toFixed(2);

  document.getElementById("pizzaTamanho").value = "normal";
  document.getElementById("borda").value = "sem";

  document.getElementById("opcoesBordaTamanho").style.display = "none";
  document.getElementById("modal").style.display = "block";

  desabilitarBotaoAdicionar();

  // Adicionar eventos para atualizar preço
  document.getElementById("pizzaTamanho").addEventListener("change", atualizarPreco);
  document.getElementById("borda").addEventListener("change", atualizarPreco);
}

// ===============================
// INTEIRA / METADE
// ===============================
function selecionarInteira() {
  aguardandoSegundaMetade = false;
  primeiraMetade = null;
  tamanhoSelecionado = null;
  bordaSelecionada = null;

  document.getElementById("opcoesBordaTamanho").style.display = "block";
  atualizarPreco();
  habilitarBotaoAdicionar();
}

function selecionarMeia() {
  aguardandoSegundaMetade = true;
  primeiraMetade = null; // Reset se já havia algo

  document.getElementById("opcoesBordaTamanho").style.display = "block";
  atualizarPreco();
  habilitarBotaoAdicionar();
}

// ===============================
// PREÇO
// ===============================
function atualizarPreco() {
  let preco = produtoSelecionado.preco;
  const tamanho = document.getElementById("pizzaTamanho").value;

  if (tamanho === "broto") preco -= 15;
  else if (tamanho === "gigante") preco += 40; // Adicionei ajuste para gigante, assumindo que estava faltando

  document.getElementById("precoFinal").innerText = preco.toFixed(2);
}

// ===============================
// MODAL
// ===============================
function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

function desabilitarBotaoAdicionar() {
  const btn = document.querySelector(".modal-buttons button");
  btn.disabled = true;
  btn.style.opacity = "0.5";
}

function habilitarBotaoAdicionar() {
  const btn = document.querySelector(".modal-buttons button");
  btn.disabled = false;
  btn.style.opacity = "1";
}