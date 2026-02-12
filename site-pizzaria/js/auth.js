/**
 * ======================================
 * AUTH.JS — AUTENTICAÇÃO DO CLIENTE
 * ======================================
 * - Cadastro
 * - Login
 * - Persistência de sessão
 * - Preenchimento da área do cliente
 * - Logout
 * - Histórico de pedidos
 */

/* =====================================================
 * CADASTRO DE CLIENTE
 * ===================================================== */
const formCadastro = document.getElementById("formCadastro");

if (formCadastro) {
  formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      nome: e.target.nome.value.trim(),
      cpf: e.target.cpf.value.trim(),
      telefone: e.target.telefone.value.trim(),
      email: e.target.email.value.trim(),
      senha: e.target.senha.value.trim(),
      endereco: {
        rua: e.target.rua.value.trim(),
        numero: e.target.numero.value.trim(),
        bairro: e.target.bairro.value.trim(),
        cidade: e.target.cidade.value.trim(),
        estado: e.target.estado.value.trim()
      }
    };

    try {
      const response = await fetch("https://mirelli-api.onrender.com/api/clientes/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      const resultado = await response.json();

      if (!response.ok) {
        alert(resultado.error || "Erro ao cadastrar.");
        return;
      }

      alert("Código de confirmação enviado para seu e-mail!");
      localStorage.setItem("emailCadastro", e.target.email.value.trim());
      window.location.href = "confirmacao.html";  // ✅ Redireciona para página dedicada
      formCadastro.reset();

    } catch (err) {
      console.error("Erro no cadastro:", err);
      alert("Erro ao conectar ao servidor.");
    }
  });
}

/* =====================================================
 * REDIRECIONAMENTO PARA CADASTRO
 * ===================================================== */
const btnCadastrar = document.getElementById("btnCadastrar");

if (btnCadastrar) {
  btnCadastrar.addEventListener("click", () => {
    window.location.href = "cadastro.html";
  });
}

/* =====================================================
 * AUTOCOMPLETE DE CEP
 * ===================================================== */
const cepInput = document.getElementById("cep");

if (cepInput) {
  cepInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 5) {
      value = value.slice(0, 5) + "-" + value.slice(5, 8);
    }
    e.target.value = value;
  });

  cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value.replace(/\D/g, "");

    if (cep.length !== 8) {
      alert("CEP deve ter 8 dígitos.");
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado.");
        return;
      }

      document.getElementById("rua").value = data.logradouro || "";
      document.getElementById("numero").value = "";
      document.getElementById("bairro").value = data.bairro || "";
      document.getElementById("cidade").value = data.localidade || "";
      document.getElementById("estado").value = data.uf || "";

    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      alert("Erro ao consultar CEP. Tente novamente.");
    }
  });
}

/* =====================================================
 * CONFIRMAÇÃO DE CADASTRO (ATUALIZADO PARA PÁGINA)
 * ===================================================== */
const formConfirmacao = document.getElementById("formConfirmacao");

if (formConfirmacao) {
  formConfirmacao.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = localStorage.getItem("emailCadastro");
    const codigo = document.getElementById("codigoConfirmacao").value.trim();

    if (!email || !codigo) {
      alert("Preencha o código.");
      return;
    }

    try {
      const response = await fetch("https://mirelli-api.onrender.com/api/clientes/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo })
      });

      const resultado = await response.json();
      if (response.ok) {
        alert("Conta confirmada! Faça o login na página inicial.");
        localStorage.removeItem("emailCadastro");
        window.location.href = "index.html";
      } else {
        alert(resultado.error || "Erro na confirmação.");
      }
    } catch (err) {
      alert("Erro ao conectar ao servidor.");
    }
  });
}

/* =====================================================
 * REENVIAR E-MAIL (OPCIONAL)
 * ===================================================== */
async function reenviarEmail() {
  const email = localStorage.getItem("emailCadastro");
  if (!email) {
    alert("E-mail não encontrado. Faça o cadastro novamente.");
    return;
  }

  try {
    const response = await fetch("https://mirelli-api.onrender.com/api/clientes/esqueci-senha", {  // Reutiliza rota existente
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const resultado = await response.json();
    if (response.ok) {
      alert("E-mail reenviado!");
    } else {
      alert(resultado.error || "Erro ao reenviar.");
    }
  } catch (err) {
    alert("Erro ao conectar ao servidor.");
  }
}

/* =====================================================
 * EVENT LISTENERS PARA O MODAL DE CONFIRMAÇÃO
 * ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const btnConfirmar = document.getElementById("btnConfirmar");
  const btnFecharModal = document.getElementById("btnFecharModal");

  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", confirmarCadastro);
  }
  if (btnFecharModal) {
    btnFecharModal.addEventListener("click", fecharModalConfirmacao);
  }
});

/* =====================================================
 * LOGIN DO CLIENTE
 * ===================================================== */
const formLogin = document.getElementById("formLogin");

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("emailLogin").value.trim();
    const senha = document.getElementById("senhaLogin").value.trim();

    try {
      const response = await fetch("https://mirelli-api.onrender.com/api/clientes/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        alert(data.error || "Erro ao fazer login.");
        return;
      }

      if (!data.token || !data.cliente) {
        console.error("Resposta inválida:", data);
        alert("Erro interno de autenticação.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("clienteLogado", JSON.stringify(data.cliente));

      location.reload();

    } catch (err) {
      console.error("Erro no login:", err);
      alert("Erro ao conectar ao servidor.");
    }
  });
}

/* =====================================================
 * PREENCHER DADOS DO CLIENTE (CORRIGIDO)
 * ===================================================== */
function preencherDadosCliente(cliente) {
  if (!cliente) return;

  const setText = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor || "Não informado";
  };

  setText("dadosNome", cliente.nome);
  setText("dadosEmail", cliente.email);
  setText("dadosTelefone", cliente.telefone);
  setText("dadosCPF", cliente.cpf);

  // 🔧 CORREÇÃO: Formatar endereço como string a partir do objeto
  if (cliente.endereco && typeof cliente.endereco === "object") {
    const e = cliente.endereco;
    const enderecoFormatado = `${e.rua || ""} ${e.numero || ""}, ${e.bairro || ""}, ${e.cidade || ""} - ${e.estado || ""}`.trim();
    setText("dadosEndereco", enderecoFormatado);
  } else {
    setText("dadosEndereco", cliente.endereco || "Não informado");
  }
}

/* =====================================================
 * MOSTRAR MEUS DADOS (INTEGRADO)
 * ===================================================== */
function mostrarDadosCliente() {
  const clienteStr = localStorage.getItem("clienteLogado");
  if (!clienteStr) {
    alert("Você não está logado.");
    return;
  }

  const cliente = JSON.parse(clienteStr);
  preencherDadosCliente(cliente); // Reutiliza a função

  document.getElementById("dadosCliente").style.display = "block";
  document.getElementById("historicoCliente").style.display = "none";
  document.getElementById("conteudoCliente").innerHTML = "<p>Dados carregados.</p>";
}

/* =====================================================
 * MOSTRAR HISTÓRICO DE PEDIDOS (INTEGRADO)
 * ===================================================== */
function mostrarHistoricoCliente() {
  const clienteStr = localStorage.getItem("clienteLogado");
  if (!clienteStr) {
    alert("Você não está logado.");
    return;
  }

  const cliente = JSON.parse(clienteStr);
  const historico = JSON.parse(localStorage.getItem(`historico_${cliente.email}`)) || [];

  const lista = document.getElementById("listaHistorico");
  lista.innerHTML = historico.length
    ? historico.map(p => `<p>Pedido #${p.id}: ${p.itens.length} itens - R$ ${p.total.toFixed(2)}</p>`).join("")
    : "<p>Nenhum pedido encontrado.</p>";

  document.getElementById("historicoCliente").style.display = "block";
  document.getElementById("dadosCliente").style.display = "none";
  document.getElementById("conteudoCliente").innerHTML = "<p>Histórico carregado.</p>";
}

/* =====================================================
 * LOGOUT (CORRIGIDO)
 * ===================================================== */
function sair() {
  localStorage.removeItem("clienteLogado");
  localStorage.removeItem("token");

  // 🔧 CORREÇÃO: Ocultar área do cliente e mostrar form de login (não ocultar toda sidebar)
  document.getElementById("areaCliente").style.display = "none";
  const formLoginSection = document.querySelector(".sidebar section"); // Seleciona apenas a seção de login
  if (formLoginSection) formLoginSection.style.display = "block";

  location.reload(); // Recarrega para resetar
}

/* =====================================================
 * MANTER LOGIN AO RECARREGAR (CORRIGIDO)
 * ===================================================== */
window.addEventListener("DOMContentLoaded", () => {
  const clienteStr = localStorage.getItem("clienteLogado");
  const token = localStorage.getItem("token");

  if (!clienteStr || !token) return;

  try {
    const cliente = JSON.parse(clienteStr);

    // 🔧 CORREÇÃO: Ocultar apenas o form de login, não toda sidebar
    const formLoginSection = document.querySelector(".sidebar section");
    if (formLoginSection) formLoginSection.style.display = "none";

    // Mostrar área do cliente
    const areaCliente = document.getElementById("areaCliente");
    if (areaCliente) areaCliente.style.display = "block";

    const nomeCliente = document.getElementById("nomeCliente");
    if (nomeCliente) nomeCliente.textContent = cliente.nome;

    preencherDadosCliente(cliente);

    // 🔧 ADIÇÃO: Adicionar event listeners aos botões (unificados aqui)
    const btnDados = document.getElementById("btnDados");
    const btnHistorico = document.getElementById("btnHistorico");
    const btnSair = document.getElementById("btnSair");

    if (btnDados) btnDados.addEventListener("click", mostrarDadosCliente);
    if (btnHistorico) btnHistorico.addEventListener("click", mostrarHistoricoCliente);
    if (btnSair) btnSair.addEventListener("click", sair);

  } catch (err) {
    console.warn("Sessão inválida. Limpando dados.");
    localStorage.removeItem("clienteLogado");
    localStorage.removeItem("token");
  }
});