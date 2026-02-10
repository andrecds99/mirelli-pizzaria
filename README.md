🍕 Mirelli Pizzaria — Sistema Completo de Pedidos Online

Sistema completo de pedidos online desenvolvido para uso real em pizzarias, com frontend público para clientes, backend robusto e painel administrativo em tempo real.

Projeto focado em fluxo operacional real, regras de negócio consistentes, comunicação em tempo real e controle financeiro diário.

🚀 Projeto em produção / funcional, utilizado como base para estudo de escalabilidade, boas práticas e arquitetura full stack.

📌 Visão Geral do Sistema

Frontend público para clientes realizarem pedidos

Backend centralizando regras de negócio

Painel administrativo em tempo real para operação da pizzaria

Comunicação instantânea via WebSocket (Socket.IO)

🚀 Funcionalidades
👤 Cliente (Frontend Público)

Cadastro e login seguro (bcrypt)

Criação de pedidos completos

Escolha de entrega:

Delivery

Retirada no balcão

Endereço salvo com observações

Pagamento via:

PIX

Dinheiro (com troco)

Débito

Crédito

Acompanhamento do status do pedido em tempo real

🧑‍🍳 Administração (Painel Administrativo)

Autenticação com JWT

Recebimento de pedidos em tempo real

Organização por status:

Novo

Em preparo

Pronto

Saiu para entrega

Entregue

Concluído

Confirmação manual de pagamentos (PIX)

Controle visual de tempo dos pedidos

Histórico imutável de pedidos finalizados

Fechamento de caixa por período

Relatórios financeiros

🧠 Regras de Negócio (Diferenciais Técnicos)

Cálculo de taxa de entrega centralizado no backend

Frontend não define valores financeiros

Pedidos com bairro não identificado entram como taxa pendente

Operador resolve exceções manualmente

Total do pedido é recalculado após confirmação

Maior segurança financeira e consistência nos relatórios

🔄 Fluxo Operacional (Vida Real)

Cliente realiza o pedido
→ Pedido chega no painel em tempo real
→ Cozinha inicia preparo
→ Pedido sai para entrega ou retirada
→ Pedido entregue
→ Pagamento confirmado
→ Pedido entra no fechamento de caixa

🛠 Tecnologias Utilizadas
Backend

Node.js

Express

MongoDB + Mongoose

JWT

Bcrypt

Socket.IO

Frontend

HTML5

CSS3

JavaScript

React (Painel Administrativo)

Axios

Infra / Ferramentas

Git & GitHub

Postman

Nodemon

Dotenv

🧱 Arquitetura do Projeto
mirelli-pizzaria/
├── backend/        # API REST + Socket.IO
├── admin-panel/    # Painel administrativo (React)
├── site-pizzaria/  # Frontend público
└── README.md

▶️ Como Rodar Localmente
Pré-requisitos

Node.js >= 18

MongoDB local ou Atlas

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

📸 Demonstração

🔜 Screenshots do sistema
🔜 Vídeo demonstrativo do fluxo completo

📌 Status do Projeto

🟢 Funcional e operacional
🟡 Em fase final de polimento e ajustes
🔜 Deploy com domínio próprio e HTTPS

🗺 Roadmap

Domínio personalizado

HTTPS

Dockerização

CI/CD

Monitoramento e logs

Melhorias de UX/UI

Multi-empresa (SaaS)

👨‍💻 Autor

André dos Santos
Desenvolvedor Full Stack
GitHub: https://github.com/andrecds99