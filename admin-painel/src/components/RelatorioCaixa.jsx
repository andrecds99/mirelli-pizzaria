// src/components/RelatorioCaixa.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function RelatorioCaixa() {
  const [rel, setRel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarRelatorio();
  }, []);

  async function carregarRelatorio() {
    try {
      const res = await api.get("/adminPainel/relatorio");
      setRel(res.data);
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  }

  function imprimirRelatorio() {
    if (!rel) return;

    const win = window.open("", "PRINT", "width=380,height=600");

    win.document.write(`
      <html>
        <head>
          <title>Fechamento de Caixa</title>
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
            p {
              margin: 4px 0;
              font-size: 14px;
            }
            hr {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .total {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h2>MIRELLI PIZZARIA</h2>
          <h3>Fechamento de Caixa</h3>

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

          <p style="text-align:center">
            ${new Date().toLocaleString()}
          </p>

          <p style="text-align:center">
            Emitido pelo sistema
          </p>
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  if (loading) return <p>Carregando relatório...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div className="relatorio">
      <h3>Fechamento de Caixa (Hoje)</h3>

      <p>Dinheiro: R$ {rel.totalDinheiro.toFixed(2)}</p>
      <p>Débito: R$ {rel.totalDebito.toFixed(2)}</p>
      <p>Crédito: R$ {rel.totalCredito.toFixed(2)}</p>
      <p>PIX: R$ {rel.totalPix.toFixed(2)}</p>

      <p>
        <strong>Total Geral: R$ {rel.totalGeral.toFixed(2)}</strong>
      </p>

      <button onClick={imprimirRelatorio}>
        🧾 Imprimir Fechamento
      </button>
    </div>
  );
}
