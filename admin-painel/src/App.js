// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Painel from "./pages/Painel";
import "./styles.css";

function App() {
  const isLoggedIn = !!localStorage.getItem("tokenAdmin"); // verifica se está logado

  return (
    <Router>
      <Routes>
        {/* Página de login */}
        <Route path="/login" element={<Login />} />

        {/* Painel administrativo */}
        <Route
          path="/painel"
          element={isLoggedIn ? <Painel /> : <Navigate to="/login" />}
        />

        {/* Rota raiz redireciona para painel ou login */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/painel" /> : <Navigate to="/login" />}
        />

        {/* Rota coringa */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
