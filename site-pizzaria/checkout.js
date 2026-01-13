/**
 * ===============================
 * CHECKOUT - FINALIZAÇÃO DO PEDIDO
 * ===============================
 * Responsável por:
 * - Carregar pedido do localStorage
 * - Exibir resumo
 * - Buscar endereço pelo CEP (ViaCEP)
 * - Confirmar pedido
 */

document.addEventListener("DOMContentLoaded", () => {
  // Recupera dados do pedido e do cliente logado
  const pedido = JSON.parse(localStorage.getItem("pedidoEmAndamento"));
  const cliente = JSON.parse(localStorage.getItem("clienteLogado"));

  // Se não existir pedido, redireciona para a home
  if (!pedido || !pedido.itens || pedido.itens.length === 0) {
    alert("Nenhum pedido encontrado.");
    window.location.href = "index.html";
    return;
  }

  const resumo = document.getElementById("resumoPedido");
  let total = 0;

  // Monta o resumo do pedido
  pedido.itens.forEach(item => {
    total += item.preco;

    resumo.innerHTML += `
      <p>
        ${item.nome} - 
        <strong>R$ ${item.preco.toFixed(2)}</strong>
      </p>
    `;
  });

  // Exibe o total do pedido
  resumo.innerHTML += `
    <hr>
    <strong>Total: R$ ${total.toFixed(2)}</strong>
  `;

  /**
   * ===============================
   * CONFIRMAR PEDIDO
   * ===============================
   * Essa função fica no escopo global
   * para ser chamada pelo botão no HTML
   */
  window.confirmarPedido = function () {
    const enderecoEntrega = montarEndereco();
    const pagamento = document.getElementById("pagamento").value;

    if (!enderecoEntrega) {
      alert("Informe um endereço válido para entrega.");
      return;
    }

    // Objeto final do pedido (pronto para enviar ao backend futuramente)
    const pedidoFinal = {
      cliente,
      itens: pedido.itens,
      total,
      endereco: enderecoEntrega,
      pagamento,
      data: new Date()
    };

    console.log("📦 Pedido enviado:", pedidoFinal);

    alert("Pedido confirmado! 🚀");

    // Limpa pedido em andamento
    localStorage.removeItem("pedidoEmAndamento");

    // Redireciona para a home
    window.location.href = "index.html";
  };
});

/**
 * ===============================
 * CEP - AUTOCOMPLETE DE ENDEREÇO
 * ===============================
 */
const cepInput = document.getElementById("cep");

if (cepInput) {
  cepInput.addEventListener("blur", buscarEnderecoPorCEP);
}

/**
 * Busca endereço usando a API ViaCEP
 */
async function buscarEnderecoPorCEP() {
  const cep = cepInput.value.replace(/\D/g, "");

  // CEP inválido
  if (cep.length !== 8) return;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      alert("CEP não encontrado.");
      return;
    }

    // Preenche os campos automaticamente
    document.getElementById("rua").value = data.logradouro || "";
    document.getElementById("bairro").value = data.bairro || "";
    document.getElementById("cidade").value = data.localidade || "";
    document.getElementById("estado").value = data.uf || "";

    // Salva endereço temporariamente
    salvarEnderecoLocal();

  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    alert("Erro ao buscar endereço.");
  }
}

/**
 * ===============================
 * UTILITÁRIOS
 * ===============================
 */

/**
 * Monta o endereço completo a partir dos inputs
 */
function montarEndereco() {
  const cep = document.getElementById("cep").value;
  const rua = document.getElementById("rua").value;
  const bairro = document.getElementById("bairro").value;
  const cidade = document.getElementById("cidade").value;
  const estado = document.getElementById("estado").value;

  if (!cep || !rua || !bairro) return null;

  return { cep, rua, bairro, cidade, estado };
}

/**
 * Salva endereço no localStorage (UX melhor)
 */
function salvarEnderecoLocal() {
  const endereco = montarEndereco();
  if (!endereco) return;

  localStorage.setItem("enderecoEntrega", JSON.stringify(endereco));
}
