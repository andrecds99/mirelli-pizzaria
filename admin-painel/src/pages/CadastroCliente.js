import React, { useState } from "react";
import axios from "axios";

export default function CadastroCliente() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    endereco: ""
  });
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/clientes/register",
        form
      );
      setMensagem(res.data.message);
      setForm({ nome: "", email: "", senha: "", telefone: "", endereco: "" });
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao cadastrar");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f8f8f8"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "320px",
          textAlign: "center"
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Cadastro de Cliente</h2>

        <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} required />
        <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
        <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required />
        <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} />
        <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} />

        <button type="submit" style={{
          marginTop: "15px",
          width: "100%",
          padding: "10px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>Cadastrar</button>

        {mensagem && <p style={{ color: "green", marginTop: "10px" }}>{mensagem}</p>}
        {erro && <p style={{ color: "red", marginTop: "10px" }}>{erro}</p>}
      </form>
    </div>
  );
}
