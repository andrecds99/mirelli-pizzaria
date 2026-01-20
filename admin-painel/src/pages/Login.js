import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/auth/login`,
        { email, senha }
      );

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminNome", res.data.admin.nome);

      onLogin(res.data.token);
    } catch (err) {
      console.error("Erro no login:", err.response?.data || err.message);
      setErro(err.response?.data?.error || "E-mail ou senha incorretos");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-box">
        <h2>Login Admin</h2>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
        />

        <button type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        {erro && <p className="erro">{erro}</p>}
      </form>
    </div>
  );
}

export default Login;
