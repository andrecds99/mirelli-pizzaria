document.addEventListener("DOMContentLoaded", () => {
    const pedido = JSON.parse(localStorage.getItem("pedidoEmAndamento"));
    const cliente = JSON.parse(localStorage.getItem("clienteLogado"));
  
    if (!pedido || !pedido.itens) {
      alert("Nenhum pedido encontrado.");
      window.location.href = "index.html";
      return;
    }
  
    const resumo = document.getElementById("resumoPedido");
    let total = 0;
  
    pedido.itens.forEach(item => {
      total += item.preco;
      resumo.innerHTML += `<p>${item.nome} - R$ ${item.preco.toFixed(2)}</p>`;
    });
  
    resumo.innerHTML += `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
  
    window.confirmarPedido = function () {
      const endereco = document.getElementById("enderecoEntrega").value;
      const pagamento = document.getElementById("pagamento").value;
  
      if (!endereco) {
        alert("Informe o endereço de entrega.");
        return;
      }
  
      const pedidoFinal = {
        cliente,
        itens: pedido.itens,
        total,
        endereco,
        pagamento
      };
  
      console.log("Pedido enviado:", pedidoFinal);
  
      alert("Pedido confirmado! 🚀");
  
      localStorage.removeItem("pedidoEmAndamento");
      window.location.href = "index.html";
    };
  });
  
