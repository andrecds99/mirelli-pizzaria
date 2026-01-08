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
// CADASTRO DE CLIENTE
// ===============================
document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
      nome: e.target.nome.value.trim(),
      cpf: e.target.cpf.value.trim(),
      endereco: e.target.endereco.value.trim(),
      telefone: e.target.telefone.value.trim(),
      email: e.target.email.value.trim(),
      senha: e.target.senha.value.trim(),
  };

  try {
      const response = await fetch("http://localhost:5000/api/clientes/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados)
      });

      const resultado = await response.json();

      if (!response.ok) {
          alert(resultado.error || "Erro ao cadastrar!");
          return;
      }

      alert("Cadastro realizado com sucesso!");
      e.target.reset();

  } catch (err) {
      alert("Erro ao conectar ao servidor!");
  }
});


// ===============================
// LOGIN DO CLIENTE
// ===============================
document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("emailLogin").value.trim();
  const senha = document.getElementById("senhaLogin").value.trim();

  try {
      const resposta = await fetch("http://localhost:5000/api/clientes/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
          alert(dados.error || "Erro ao fazer login!");
          return;
      }

      // Salvar usuário logado
      localStorage.setItem("clienteLogado", JSON.stringify(dados.cliente));

      // Esconder sidebar e mostrar área do cliente
      document.querySelector(".sidebar").style.display = "none";
      document.getElementById("areaCliente").style.display = "block";

      // Preencher nome na área superior
      document.getElementById("nomeCliente").textContent = dados.cliente.nome;

      // Preencher dados
      preencherDadosCliente(dados.cliente);

  } catch (erro) {
      alert("Erro ao conectar ao servidor!");
  }
});


// ===============================
// PREENCHE OS DADOS DO CLIENTE
// ===============================
function preencherDadosCliente(cliente) {
  document.getElementById("dadosNome").textContent = cliente.nome;
  document.getElementById("dadosEmail").textContent = cliente.email;
  document.getElementById("dadosTelefone").textContent = cliente.telefone;
  document.getElementById("dadosEndereco").textContent = cliente.endereco;
  document.getElementById("dadosCPF").textContent = cliente.cpf;
}


// ===============================
// MANTER LOGIN AO RECARREGAR
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado"));
  if (cliente) {
      document.querySelector(".sidebar").style.display = "none";
      document.getElementById("areaCliente").style.display = "block";
      document.getElementById("nomeCliente").textContent = cliente.nome;
      preencherDadosCliente(cliente);
  }
});


// ===============================
// BOTÃO "MEUS DADOS"
// ===============================
document.getElementById("btnDados").addEventListener("click", () => {
  document.getElementById("dadosCliente").style.display = "block";
});


// ===============================
// LOGOUT
// ===============================
document.getElementById("btnSair").addEventListener("click", () => {
  localStorage.removeItem("clienteLogado");
  document.getElementById("areaCliente").style.display = "none";
  document.querySelector(".sidebar").style.display = "block";
});

// ================================
// PÁGINA: MEUS DADOS
// ================================
async function carregarMeusDados() {
  const token = localStorage.getItem("token");

  if (!token) {
      alert("Você precisa fazer login.");
      window.location.href = "index.html";
      return;
  }

  try {
      const response = await fetch("http://localhost:5000/api/user/me", {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`
          }
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.message || "Erro ao carregar dados");
      }

      // Inserindo no HTML
      document.getElementById("userName").textContent = data.name;
      document.getElementById("userEmail").textContent = data.email;

  } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao carregar informações.");
      window.location.href = "index.html";
  }
}

// Executar automaticamente SE estiver na página Meus Dados
if (window.location.pathname.includes("meus-dados.html")) {
  carregarMeusDados();
}


// ================================
// BOTÃO DE LOGOUT
// ================================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
  });
}
