// ===============================
// CADASTRO DE CLIENTE
// ===============================
const formCadastro = document.getElementById("formCadastro");

if (formCadastro) {
  formCadastro.addEventListener("submit", async (e) => {
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
        body: JSON.stringify(dados),
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
      console.error(err);
    }
  });
}


// ===============================
// LOGIN DO CLIENTE
// ===============================
const formLogin = document.getElementById("formLogin");

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
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
      console.log("RESPOSTA LOGIN:", dados);

      if (!resposta.ok) {
        alert(dados.error || "Erro ao fazer login!");
        return;
      }

      // ✅ SUPORTE A QUALQUER PADRÃO DE BACKEND
      const cliente = dados.cliente || dados.user || dados.usuario;

      if (!cliente) {
        alert("Erro ao recuperar dados do cliente.");
        console.error("Resposta inesperada:", dados);
        return;
      }

      // Salva cliente
      localStorage.setItem("clienteLogado", JSON.stringify(cliente));

      // Salva token se existir
      if (dados.token) {
        localStorage.setItem("token", dados.token);
      }

      // UI
      const sidebar = document.querySelector(".sidebar");
      if (sidebar) sidebar.style.display = "none";

      const areaCliente = document.getElementById("areaCliente");
      if (areaCliente) areaCliente.style.display = "block";

      const nomeCliente = document.getElementById("nomeCliente");
      if (nomeCliente) nomeCliente.textContent = cliente.nome;

      preencherDadosCliente(cliente);

    } catch (erro) {
      alert("Erro ao conectar ao servidor!");
      console.error(erro);
    }
  });
}


// ===============================
// PREENCHE OS DADOS DO CLIENTE
// ===============================
function preencherDadosCliente(cliente) {
  if (!cliente) return;

  const set = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor || "";
  };

  set("dadosNome", cliente.nome);
  set("dadosEmail", cliente.email);
  set("dadosTelefone", cliente.telefone);
  set("dadosEndereco", cliente.endereco);
  set("dadosCPF", cliente.cpf);
}


// ===============================
// MANTER LOGIN AO RECARREGAR
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  const clienteStr = localStorage.getItem("clienteLogado");

  if (!clienteStr) return;

  try {
    const cliente = JSON.parse(clienteStr);

    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.style.display = "none";

    const areaCliente = document.getElementById("areaCliente");
    if (areaCliente) areaCliente.style.display = "block";

    const nomeCliente = document.getElementById("nomeCliente");
    if (nomeCliente) nomeCliente.textContent = cliente.nome;

    preencherDadosCliente(cliente);

  } catch (e) {
    console.warn("Sessão inválida, limpando localStorage");
    localStorage.removeItem("clienteLogado");
  }
});


// ===============================
// BOTÃO "MEUS DADOS"
// ===============================
const btnDados = document.getElementById("btnDados");
if (btnDados) {
  btnDados.addEventListener("click", () => {
    const dados = document.getElementById("dadosCliente");
    if (dados) dados.style.display = "block";
  });
}


// ===============================
// LOGOUT
// ===============================
const btnSair = document.getElementById("btnSair");

if (btnSair) {
  btnSair.addEventListener("click", () => {
    localStorage.removeItem("clienteLogado");
    localStorage.removeItem("token");

    const areaCliente = document.getElementById("areaCliente");
    if (areaCliente) areaCliente.style.display = "none";

    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.style.display = "block";
  });
}
