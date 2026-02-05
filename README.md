🍕 Mirelli Pizzaria — Sistema Completo de Pedidos Online

Sistema completo de pedidos online desenvolvido para uso real em pizzarias e pequenos comércios, com frontend público para clientes, backend robusto e painel administrativo em tempo real para operação diária.

Projeto focado em fluxo operacional real, controle de pedidos, caixa e comunicação instantânea entre cliente, cozinha e administração.

🚀 Funcionalidades
👤 Cliente (Frontend Público)

Cadastro e login seguro (hash de senha com bcrypt)

Criação de pedidos completos

Escolha de método de entrega:

Delivery

Retirada no balcão

Endereço salvo com observações de entrega

Escolha de forma de pagamento:

PIX

Dinheiro (com troco)

Débito

Crédito

Acompanhamento do status do pedido em tempo real

🧑‍🍳 Administração (Painel Administrativo)

Login administrativo com autenticação JWT

Recebimento de pedidos em tempo real (Socket.IO)

Organização de pedidos por abas:

Pedidos ativos

Pedidos concluídos / cancelados

Fluxo de status controlado:

Novo

Em preparo

Pronto

Saiu para entrega

Entregue

Concluído

Confirmação manual de pagamentos (ex: PIX)

Impressão de pedidos (modelo térmico 80mm)

Controle visual de tempo do pedido:

Pedido dentro do prazo

Pedido em atenção

Pedido atrasado

Histórico imutável de pedidos concluídos

Relatório de caixa por período

Fechamento de caixa baseado apenas em pedidos concluídos

🧩 Fluxo Operacional (Vida Real)
Cliente faz pedido
→ Pedido chega no painel em tempo real
→ Cozinha inicia preparo
→ Pedido sai para entrega ou retirada
→ Pedido é entregue
→ Pagamento confirmado
→ Pedido entra no fechamento de caixa


Esse fluxo reflete exatamente a rotina de uma pizzaria.

Sistema completo de pedidos online para pizzaria, com frontend público, backend robusto, painel administrativo em tempo real e controle de pedidos via WebSocket.

Projeto desenvolvido com foco em uso real, regras de negócio realistas, organização de código, boas práticas e escala futura.

🚀 Funcionalidades
👤 Cliente

Cadastro de usuário com senha criptografada (bcrypt)

Login autenticado com JWT

Criação de pedidos online

Escolha de método de pagamento (PIX, dinheiro, débito, crédito)

Acompanhamento do status do pedido

Checkout com fluxo realista de entrega

Pedido pode ser realizado mesmo quando a taxa de entrega precisa de confirmação manual

🧑‍🍳 Administração

Login administrativo com autenticação JWT

Painel de pedidos em tempo real (Socket.IO)

Destaque visual para pedidos com taxa de entrega pendente

Definição manual da taxa de entrega pelo operador

Confirmação manual de pagamentos PIX

Atualização do status dos pedidos

Fechamento de caixa diário

Geração de relatórios financeiros em PDF e CSV

🧠 Regras de Negócio (Diferenciais)

Cálculo da taxa de entrega centralizado no backend

O frontend não define valores de taxa

Pedidos com bairro não identificado são marcados como taxa pendente

Operador pode resolver exceções definindo a taxa manualmente

Total do pedido é recalculado após confirmação da taxa

Maior segurança financeira e consistência nos relatórios

🛠 Tecnologias Utilizadas
Backend

Node.js

Express

MongoDB + Mongoose

JWT (autenticação)

Bcrypt (segurança)

Socket.IO

Frontend

HTML5

CSS3

JavaScript

React (Painel Administrativo)

Axios


Infra / Outros

Infraestrutura / Ferramentas


Git & GitHub

Postman

Nodemon

Dotenv

🧱 Arquitetura do Projeto

🧩 Arquitetura do Projeto

mirelli-pizzaria/
├── backend/        # API REST + Socket.IO
├── admin-panel/    # Painel administrativo (React)
├── site-pizzaria/  # Frontend público (clientes)
└── README.md

▶️ Como Rodar o Projeto Localmente
Pré-requisitos

Node.js >= 18

MongoDB local ou MongoDB Atlas

NPM ou Yarn

Backend
cd backend
npm install
npm run dev

Frontend Público
cd site-pizzaria
# abrir index.html no navegador

Painel Administrativo
cd admin-panel
npm install
npm start

📊 Painel Administrativo

O painel permite:

Visualizar pedidos em tempo real

Gerenciar status dos pedidos

Confirmar pagamentos

Imprimir pedidos


Separar pedidos ativos e concluídos

Gerar relatórios de caixa

Comunicação em tempo real via Socket.IO.

Resolver taxa de entrega pendente

Fechar o caixa diário

Gerar relatórios financeiros

A comunicação em tempo real é feita via Socket.IO.

📌 Status do Projeto

🟢 Funcional e utilizável em ambiente real
🟡 Em fase final de ajustes

🔜 Deploy em produção e domínio próprio

✔️ Lógica pronta para uso real
🔜 Deploy em produção e compra de domínio

🗺 Roadmap (Próximos Passos)

Deploy em produção (HTTPS)

Domínio personalizado

Autenticação por e-mail (SMTP)

Dockerização

CI/CD

Monitoramento e logs

Melhorias de UX/UI

Multi-empresa (SaaS)

👨‍💻 Autor

André dos Santos
Desenvolvedor Full Stack
GitHub: https://github.com/andrecds99
