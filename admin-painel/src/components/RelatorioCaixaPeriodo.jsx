// src/components/RelatorioCaixaPeriodo.jsx
import React, { useState } from "react";
import api from "../api/api";

export default function RelatorioCaixaPeriodo() {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [rel, setRel] = useState(null);
  const [loading, setLoading] = useState(false);

  async function buscarRelatorio() {
    if (!inicio || !fim) {
      alert("Selecione o período");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/adminPainel/relatorio-periodo", {
        params: { inicio, fim }
      });
      setRel(res.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  }

  function imprimir() {
    if (!rel) return;

    const win = window.open("", "PRINT", "width=400,height=600");

    win.document.write(`
      <html>
        <head>
          <title>Relatório de Caixa</title>
          <style>
            body {
              font-family: monospace;
              width: 302px;
              padding: 10px;
            }
            h2, h3 {
              text-align: center;
              margin: 4px 0;
            }
            hr {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .total {
              font-weight: bold;
              font-size: 16px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h2>MIRELLI PIZZARIA</h2>
          <h3>Fechamento de Caixa</h3>
          <p style="text-align:center">
            ${inicio} até ${fim}
          </p>

          <hr />

          <p>Dinheiro: R$ ${rel.totalDinheiro.toFixed(2)}</p>
          <p>Débito: R$ ${rel.totalDebito.toFixed(2)}</p>
          <p>Crédito: R$ ${rel.totalCredito.toFixed(2)}</p>
          <p>PIX: R$ ${rel.totalPix.toFixed(2)}</p>

          <hr />

          <p class="total">
            TOTAL GERAL: R$ ${rel.totalGeral.toFixed(2)}
          </p>

          <hr />
          <p style="text-align:center">Relatório emitido pelo sistema</p>
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  return (
    <div className="relatorio">
      <h3>Relatório de Caixa por Período</h3>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="date"
          value={inicio}
          onChange={e => setInicio(e.target.value)}
        />
        <input
          type="date"
          value={fim}
          onChange={e => setFim(e.target.value)}
        />
        <button onClick={buscarRelatorio} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {rel && (
        <>
          <p>Dinheiro: R$ {rel.totalDinheiro.toFixed(2)}</p>
          <p>Débito: R$ {rel.totalDebito.toFixed(2)}</p>
          <p>Crédito: R$ {rel.totalCredito.toFixed(2)}</p>
          <p>PIX: R$ {rel.totalPix.toFixed(2)}</p>
          <p><strong>Total Geral: R$ {rel.totalGeral.toFixed(2)}</strong></p>

          <button onClick={imprimir}>
            🖨️ Imprimir Relatório
          </button>
        </>
      )}
    </div>
  );
}
