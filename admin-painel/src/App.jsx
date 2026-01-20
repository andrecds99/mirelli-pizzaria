// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";

import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";

// Componentes existentes (opcionais)
import PainelPedidos from "./components/PainelPedidos";
import Relatorio from "./components/RelatorioCaixa";

import "./styles.css";
import "./App.css";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));

  function onLogin(newToken) {
    localStorage.setItem("adminToken", newToken);
    setToken(newToken);
  }

  function onLogout() {
    localStorage.removeItem("adminToken");
    setToken(null);
  }

  return (
    <BrowserRouter>
      <div className="app-root">
        {!token ? (
          <Login onLogin={onLogin} />
        ) : (
          <>
            <Pedidos token={token} onLogout={onLogout} />

            {/* Futuros */}
            {/* <PainelPedidos /> */}
            {/* <Relatorio /> */}
          </>
        )}
      </div>
    </BrowserRouter>
  );
}
