# 🍕 Mirelli Pizzaria — Sistema Completo de Pedidos Online

Sistema completo de pedidos online para pizzaria, com **frontend público**, **backend robusto**, **painel administrativo em tempo real** e **controle de pedidos via WebSocket**.

Projeto desenvolvido com foco em **uso real**, **organização de código**, **boas práticas** e **escala futura**.

---

## 🚀 Funcionalidades

### 👤 Cliente
- Cadastro com hash de senha (bcrypt)
- Login autenticado
- Criação de pedidos
- Escolha de método de pagamento (PIX, dinheiro, débito, crédito)
- Acompanhamento de pedidos

### 🧑‍🍳 Administração
- Login administrativo com JWT
- Painel de pedidos em tempo real (Socket.IO)
- Confirmação manual de pagamentos PIX
- Filtro de pedidos por status
- Fechamento de caixa diário
- Geração de relatórios em PDF e CSV

---

## 🛠 Tecnologias Utilizadas

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT (autenticação)
- Bcrypt (segurança)
- Socket.IO
- PDFKit
- JSON2CSV

### Frontend
- HTML5
- CSS3
- JavaScript
- React (Painel Administrativo)
- Axios

### Infra / Outros
- Git & GitHub
- Postman
- Nodemon
- Dotenv

---

## 🧩 Arquitetura do Projeto

```bash
mirelli-pizzaria/
├── backend/        # API REST + Socket.IO
├── admin-panel/    # Painel administrativo (React)
├── site-pizzaria/  # Frontend público (HTML/CSS/JS)
└── README.md

▶️ Como Rodar o Projeto Localmente
Pré-requisitos

Node.js >= 18

MongoDB local ou Atlas

NPM ou Yarn

Backend
cd backend
npm install
npm run dev

Frontend público
cd site-pizzaria
# abrir index.html no navegador

Painel administrativo
cd admin-panel
npm install
npm start

📊 Painel Administrativo

O painel permite:

Visualizar pedidos em tempo real

Confirmar pagamentos

Atualizar status dos pedidos

Enviar pedidos para a cozinha

Comunicação em tempo real feita via Socket.IO.

📌 Status do Projeto

🟡 Em fase final de ajustes
✔️ Funcional para uso real
🔜 Deploy público e compra de domínio

🗺 Próximos Passos (Roadmap)

Deploy em produção

Autenticação por e-mail (SMTP)

Dockerização

CI/CD

Monitoramento e logs

Melhorias de UX/UI

👨‍💻 Autor

André dos Santos
Desenvolvedor Full Stack
GitHub: https://github.com/andrecds99