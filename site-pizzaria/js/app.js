document.addEventListener("DOMContentLoaded", () => {
    renderMenu();
  });
  
  // ===============================
// ÁREA DO CLIENTE - APP.JS
// ===============================

// Funções para os botões da área do cliente
document.getElementById("btnDados").addEventListener("click", mostrarDadosCliente);
document.getElementById("btnHistorico").addEventListener("click", mostrarHistoricoCliente);
document.getElementById("btnSair").addEventListener("click", sair);

// Mostrar Meus Dados
function mostrarDadosCliente() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado"));
  if (!cliente) return;

  document.getElementById("dadosNome").innerText = cliente.nome;
  document.getElementById("dadosEmail").innerText = cliente.email;
  document.getElementById("dadosTelefone").innerText = cliente.telefone || "Não informado";
  document.getElementById("dadosEndereco").innerText = cliente.endereco || "Não informado";
  document.getElementById("dadosCPF").innerText = cliente.cpf || "Não informado";

  document.getElementById("dadosCliente").style.display = "block";
  document.getElementById("historicoCliente").style.display = "none";
  document.getElementById("conteudoCliente").innerHTML = "<p>Dados carregados.</p>";
}

// Mostrar Histórico de Pedidos
function mostrarHistoricoCliente() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado"));
  if (!cliente) return;

  // Simular histórico (em produção, busque de um backend/API)
  const historico = JSON.parse(localStorage.getItem(`historico_${cliente.email}`)) || [];

  const lista = document.getElementById("listaHistorico");
  lista.innerHTML = historico.length ? historico.map(p => `<p>Pedido #${p.id}: ${p.itens.length} itens - R$ ${p.total.toFixed(2)}</p>`).join("") : "<p>Nenhum pedido encontrado.</p>";

  document.getElementById("historicoCliente").style.display = "block";
  document.getElementById("dadosCliente").style.display = "none";
  document.getElementById("conteudoCliente").innerHTML = "<p>Histórico carregado.</p>";
}

// Sair
function sair() {
  localStorage.removeItem("clienteLogado");
  document.getElementById("areaCliente").style.display = "none";
  // Recarregar página ou redirecionar
  location.reload();
}

// Ao carregar a página, verificar se está logado
window.addEventListener("load", () => {
  const cliente = localStorage.getItem("clienteLogado");
  if (cliente) {
    const dados = JSON.parse(cliente);
    document.getElementById("nomeCliente").innerText = dados.nome;
    document.getElementById("areaCliente").style.display = "block";
  }
  atualizarCarrinho(); // Carregar carrinho salvo
});