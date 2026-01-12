import React from "react";
import PainelPedidos from "./components/PainelPedidos";
import Relatorio from "./components/Relatorio";
import "./App.css";
import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";
import "./styles.css";


function App() {
    return (
        <div className="App">
            <h1>Painel Administrativo</h1>
            <PainelPedidos />
            <Relatorio />
        </div>
    );
}

function App() {
    const [token, setToken] = useState(localStorage.getItem("adminToken"));
  
    function onLogin(newToken) {
      setToken(newToken);
    }
  
    function onLogout() {
      setToken(null);
    }
  
    return (
      <div className="app-root">
        {!token ? <Login onLogin={onLogin} /> : <Pedidos token={token} onLogout={onLogout} />}
      </div>
    );
  }

export default App;
