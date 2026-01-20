// src/components/PrintPedido.jsx
import React from "react";

export default function PrintPedido({ pedido }) {
  if (!pedido) return null;

  function imprimir() {
    const win = window.open("", "PRINT", "width=400,height=600");

    win.document.write(`
      <html>
        <head>
          <title>Pedido #${pedido.numeroPedido}</title>
          <style>
            body {
              font-family: monospace;
              width: 302px;
              margin: 0;
              padding: 10px;
            }
            h2, h3 {
              text-align: center;
              margin: 4px 0;
            }
            hr {
              border: none;
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .item {
              margin-bottom: 6px;
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
          <h3>Pedido #${pedido.numeroPedido}</h3>

          <hr />

          <p><strong>Cliente:</strong> ${pedido.clienteInfo?.nome || "-"}</p>
          <p><strong>Telefone:</strong> ${pedido.clienteInfo?.telefone || "-"}</p>

          ${
            pedido.metodoEntrega === "delivery"
              ? `<p><strong>Endereço:</strong> ${pedido.endereco.logradouro}, ${pedido.endereco.numero}</p>`
              : `<p><strong>Retirada no balcão</strong></p>`
          }

          <hr />

          ${pedido.itens
            .map(
              i => `
                <div class="item">
                  ${i.quantidade}x ${i.produto.nome}<br/>
                  Tam: ${i.produto.tamanho || "-"} | Borda: ${i.produto.borda || "-"}<br/>
                  Obs: ${i.produto.observacoes || "-"}<br/>
                  R$ ${i.preco.toFixed(2)}
                </div>
              `
            )
            .join("")}

          <hr />

          <p><strong>Pagamento:</strong> ${pedido.pagamento}</p>
          ${
            pedido.pagamento === "dinheiro"
              ? `<p><strong>Troco para:</strong> R$ ${pedido.trocoPara}</p>`
              : ""
          }

          <p class="total">TOTAL: R$ ${pedido.total.toFixed(2)}</p>

          <hr />

          <p style="text-align:center">Obrigado pela preferência!</p>
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  return (
    <button onClick={imprimir}>
      🖨️ Imprimir Pedido
    </button>
  );
}
