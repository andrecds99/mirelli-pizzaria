🍕 Mirelli Pizzaria — Sistema de Pedidos Online (Backend-Focused)

Sistema completo de pedidos online desenvolvido com foco em regras de negócio reais, API robusta, comunicação em tempo real e uso prático em ambiente de produção.

O projeto simula fielmente o fluxo operacional de uma pizzaria, integrando frontend público, API backend e painel administrativo, todos consumindo a mesma fonte de dados e eventos.

🎯 Objetivo do Projeto

Demonstrar domínio em:

Modelagem de regras de negócio reais

Desenvolvimento de API REST escalável

Comunicação em tempo real com WebSockets

Autenticação e segurança

Integração entre múltiplos clientes (frontend + painel)

Backend como única fonte de verdade

🌐 Aplicações em Produção

🔗 Os links públicos serão adicionados aqui

Frontend Público (Clientes) https://mirelli-pizzaria-site.vercel.app/

Painel Administrativo https://mirelli-pizzaria-admin.vercel.app/

API Backend https://mirelli-api.onrender.com

⚠️ Observação Frontend público e painel administrativo consomem a mesma API e se comunicam em tempo real via Socket.IO.

🔄 Fluxo Operacional (Vida Real) Cliente cria pedido no frontend público → API valida regras de negócio → Pedido é persistido no banco → Evento é emitido via Socket.IO → Painel administrativo recebe o pedido em tempo real → Admin altera status do pedido → Evento retorna ao cliente em tempo real → Pedido entra no fechamento de caixa

Esse fluxo representa exatamente a rotina de operação de uma pizzaria.

🚀 Funcionalidades 👤 Cliente (Frontend Público)

Cadastro de usuário com confirmação por e-mail (página dedicada com CEP autocomplete)

Login autenticado (JWT)

Criação de pedidos completos

Escolha de tipo de entrega:

Delivery

Retirada no balcão

Escolha de forma de pagamento:

PIX

Dinheiro (com troco)

Débito

Crédito

Endereço com observações

Acompanhamento do status do pedido em tempo real

🧑‍🍳 Administração (Painel Administrativo)

Login administrativo autenticado (JWT)

Recebimento de pedidos em tempo real (Socket.IO)

Organização de pedidos por status:

Novo

Em preparo

Pronto

Saiu para entrega

Entregue

Concluído / Cancelado

Confirmação manual de pagamentos (ex: PIX)

Destaque visual por tempo de preparo

Histórico imutável de pedidos

Relatório de caixa por período

Fechamento de caixa baseado apenas em pedidos concluídos

Impressão de pedidos (modelo térmico 80mm)

🧠 Regras de Negócio (Diferenciais)

Taxa de entrega calculada exclusivamente no backend

Frontend não define valores críticos

Pedidos com bairro não identificado entram como taxa pendente

Operador define manualmente exceções

Total do pedido é recalculado no servidor

Garantia de consistência financeira nos relatórios

🧪 Casos Reais Cobertos

Pedido com taxa de entrega indefinida

Confirmação manual de pagamento PIX

Atualização de status em tempo real

Fechamento de caixa seguro

Histórico para auditoria

Comunicação simultânea entre múltiplos clientes

🔐 Credenciais de Teste (Ambiente de Demonstração) 🧑‍🍳 Admin Email: admin@mirelli.com Senha: admin123

👤 Cliente (opção rápida) Email: andreteste@email.com Senha: 123456

📌 Observação Também é possível criar um novo cadastro. O sistema envia e-mail de confirmação antes de permitir a realização de pedidos.

🛠 Tecnologias Utilizadas Backend

Node.js

Express

MongoDB + Mongoose

JWT (autenticação)

Bcrypt (hash de senha)

Socket.IO

SendGrid (confirmação por e-mail)  # ✅ Atualizado: de Nodemailer para SendGrid

Frontend

HTML5

CSS3

JavaScript

React (Painel Administrativo)

Axios

Infra / Ferramentas

Git & GitHub

Postman

Dotenv

Nodemon

Vercel (deploy frontend)

Render (deploy backend)  # ✅ Adicionado para clareza

🧱 Arquitetura do Projeto mirelli-pizzaria/ ├── backend/ # API REST + WebSocket ├── admin-panel/ # Painel administrativo (React) ├── site-pizzaria/ # Frontend público (clientes, incluindo cadastro.html) └── README.md

📌 Princípios Arquiteturais

Backend como única fonte de verdade

Separação clara de responsabilidades

Comunicação orientada a eventos

Regras de negócio centralizadas

Segurança financeira e consistência de dados

▶️ Como Rodar Localmente Pré-requisitos

Node.js >= 18

MongoDB (local ou Atlas)

NPM ou Yarn

Backend cd backend npm install npm run dev

Frontend Público cd site-pizzaria # Abrir index.html no navegador (ou usar um servidor local para cadastro.html)

Painel Administrativo cd admin-panel npm install npm start

📌 Status do Projeto

🟢 Backend em produção e funcional 🟢 Cadastro completo com confirmação por e-mail e CEP autocomplete 🟡 Pequenas melhorias de UX/UI

Sistema já operando com pedidos fluindo entre cliente, API e painel administrativo.

🗺 Roadmap

Domínio personalizado

HTTPS completo

Dockerização

CI/CD

Monitoramento e logs

Multi-empresa (SaaS)

Melhorias de performance

👨‍💻 Autor

André dos Santos Desenvolvedor Backend / Full Stack

GitHub: https://github.com/andrecds99