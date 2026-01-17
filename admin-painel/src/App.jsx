import React, { useState } from "react";
import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";

// Componentes existentes (mantidos no projeto)
import PainelPedidos from "./components/PainelPedidos";
import Relatorio from "./components/Relatorio";

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
    <div className="app-root">
      {!token ? (
        <Login onLogin={onLogin} />
      ) : (
        <>
          {/* Página principal do painel */}
          <Pedidos token={token} onLogout={onLogout} />

          {/* Componentes extras (opcionais / futuros) */}
          {/* <PainelPedidos /> */}
          {/* <Relatorio /> */}
        </>
      )}
    </div>
  );
}
