/**
 * ======================================
 * AUTH.JS — AUTENTICAÇÃO DO CLIENTE
 * ======================================
 * - Cadastro
 * - Login
 * - Persistência de sessão
 * - Preenchimento da área do cliente
 * - Logout
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

      // 🔴 IMPORTANTE: endereço como OBJETO
      endereco: {
        rua: e.target.endereco.value.trim(),
        bairro: "",
        cidade: "",
        estado: ""
      }
    };

    try {
      const response = await fetch("http://mirelli-api.onrender.com/api/clientes/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      const resultado = await response.json();

      if (!response.ok) {
        alert(resultado.error || "Erro ao cadastrar.");
        return;
      }

      alert("✅ Cadastro realizado com sucesso!");
      formCadastro.reset();

    } catch (err) {
      console.error("Erro no cadastro:", err);
      alert("Erro ao conectar ao servidor.");
    }
  });
}

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
      const response = await fetch("http://mirelli-api.onrender.com/api/clientes/login", {
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

      // 🔐 SALVA SESSÃO
      localStorage.setItem("token", data.token);
      localStorage.setItem("clienteLogado", JSON.stringify(data.cliente));

      // 🔄 Recarrega para atualizar UI
      location.reload();

    } catch (err) {
      console.error("Erro no login:", err);
      alert("Erro ao conectar ao servidor.");
    }
  });
}

/* =====================================================
 * PREENCHER DADOS DO CLIENTE
 * ===================================================== */
function preencherDadosCliente(cliente) {
  if (!cliente) return;

  const setText = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor || "";
  };

  setText("dadosNome", cliente.nome);
  setText("dadosEmail", cliente.email);
  setText("dadosTelefone", cliente.telefone);
  setText("dadosCPF", cliente.cpf);

  if (cliente.endereco) {
    const e = cliente.endereco;
    setText(
      "dadosEndereco",
      `${e.rua || ""} ${e.bairro || ""} ${e.cidade || ""} ${e.estado || ""}`.trim()
    );
  }
}

/* =====================================================
 * MANTER LOGIN AO RECARREGAR
 * ===================================================== */
window.addEventListener("DOMContentLoaded", () => {
  const clienteStr = localStorage.getItem("clienteLogado");
  const token = localStorage.getItem("token");

  if (!clienteStr || !token) return;

  try {
    const cliente = JSON.parse(clienteStr);

    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.style.display = "none";

    const areaCliente = document.getElementById("areaCliente");
    if (areaCliente) areaCliente.style.display = "block";

    const nomeCliente = document.getElementById("nomeCliente");
    if (nomeCliente) nomeCliente.textContent = cliente.nome;

    preencherDadosCliente(cliente);

  } catch (err) {
    console.warn("Sessão inválida. Limpando dados.");
    localStorage.removeItem("clienteLogado");
    localStorage.removeItem("token");
  }
});

/* =====================================================
 * BOTÃO "MEUS DADOS"
 * ===================================================== */
const btnDados = document.getElementById("btnDados");
if (btnDados) {
  btnDados.addEventListener("click", () => {
    const dados = document.getElementById("dadosCliente");
    if (dados) dados.style.display = "block";
  });
}

/* =====================================================
 * LOGOUT
 * ===================================================== */
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
