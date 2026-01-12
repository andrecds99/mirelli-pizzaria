// src/pages/Login.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  // ✅ Se já estiver logado, redireciona automaticamente
  useEffect(() => {
    const token = localStorage.getItem("tokenAdmin");
    if (token) {
      navigate("/painel");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/auth/login`,
        { email, senha }
      );

      localStorage.setItem("tokenAdmin", res.data.token);
      localStorage.setItem("adminNome", res.data.admin.nome);

      navigate("/painel");
    } catch (err) {
      console.error("Erro no login:", err.response?.data || err.message);
      setErro(err.response?.data?.error || "E-mail ou senha incorretos");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#f5f5f5",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "300px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Login Admin</h2>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          disabled={carregando}
          style={{
            width: "100%",
            padding: "10px",
            background: carregando ? "#9ccc9c" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        {erro && (
          <p
            style={{
              color: "red",
              marginTop: "10px",
              fontSize: "14px",
            }}
          >
            {erro}
          </p>
        )}
      </form>
    </div>
  );
}

export default Login;
