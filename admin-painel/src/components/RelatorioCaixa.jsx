// src/components/RelatorioCaixa.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function RelatorioCaixa() {
  const [rel, setRel] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const res = await api.get("/adminPainel/relatorio");
      setRel(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  if (!rel) return <p>Carregando relatório...</p>;

  return (
    <div className="relatorio">
      <h3>Fechamento de Caixa (Hoje)</h3>
      <p>Total Dinheiro: R$ {rel.totalDinheiro.toFixed(2)}</p>
      <p>Total Débito: R$ {rel.totalDebito.toFixed(2)}</p>
      <p>Total Crédito: R$ {rel.totalCredito.toFixed(2)}</p>
      <p>Total PIX: R$ {rel.totalPix.toFixed(2)}</p>
      <p><strong>Total Geral: R$ {rel.totalGeral.toFixed(2)}</strong></p>
    </div>
  );
}
