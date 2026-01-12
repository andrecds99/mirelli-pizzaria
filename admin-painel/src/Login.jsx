// src/pages/Login.jsx
import React, { useState } from "react";
import api from "../api/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/admin/login", { email, senha });
      const token = res.data.token;
      if (!token) throw new Error("Resposta sem token");
      localStorage.setItem("adminToken", token);
      onLogin(token);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Erro ao realizar login");
    }
  }

  return (
    <div className="login-box">
      <h2>Login - Painel Admin</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email}
               onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={senha}
               onChange={e => setSenha(e.target.value)} required />
        <button type="submit">Entrar</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
