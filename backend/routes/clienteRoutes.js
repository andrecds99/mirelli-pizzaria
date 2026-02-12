const express = require('express');
const router = express.Router();
const Cliente = require('../models/cliente');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const enviarEmailConfirmacao = require('../middlewares/emailMiddleware');
const crypto = require('crypto');

/**
 * Rota: Cadastro de cliente
 * Acesso: Público
 */
router.post('/cadastro', async (req, res) => {
    console.log("Requisição recebida no cadastro:", req.body);  // Log dos dados recebidos

    const { nome, email, senha, telefone, endereco } = req.body;

    if (!senha || senha.length < 6) {
        console.log("Erro: Senha inválida ou curta");
        return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres." });
    }

    try {
        console.log("Verificando cliente existente...");
        const clienteExistente = await Cliente.findOne({ email });
        if (clienteExistente) {
            console.log("Erro: E-mail já cadastrado");
            return res.status(400).json({ error: "E-mail já cadastrado" });
        }

        console.log("Gerando hash da senha...");
        const senhaHash = await bcrypt.hash(senha, 10);
        console.log("Hash gerado:", senhaHash ? "Sucesso" : "Falhou");

        console.log("Gerando token...");
        const tokenConfirmacao = crypto.randomUUID();
        const expiraEm = new Date(Date.now() + 24 * 60 * 60 * 1000);

        console.log("Criando novo cliente...");
        const novoCliente = new Cliente({
            nome,
            email,
            senha: senhaHash,
            telefone,
            endereco,
            confirmado: false,
            tokenConfirmacao,
            expiraEm
        });

        console.log("Salvando no banco...");
        await novoCliente.save();
        console.log("Cliente salvo com sucesso");

        console.log("Enviando e-mail...");
        try {
            await enviarEmailConfirmacao(email, nome, tokenConfirmacao);
            console.log("E-mail enviado");
        } catch (emailError) {
            console.error('Erro no envio de e-mail:', emailError.message);
        }

        console.log("Cadastro concluído");
        res.status(201).json({
            message: "Cliente cadastrado com sucesso. Verifique seu e-mail para confirmação."
        });
    } catch (err) {
        console.error("Erro geral no cadastro:", err.message);
        console.error("Stack:", err.stack);  // Log completo do erro
        res.status(500).json({ error: err.message });
    }
});
/**
 * Rota: Confirmação de cadastro
 * Acesso: Público
 */
router.get('/confirmar-token', async (req, res) => {
    const { token } = req.query;
    
    try {
        const cliente = await Cliente.findOne({ tokenConfirmacao: token });
        if (!cliente) return res.status(400).send("Token inválido ou expirado.");
        
        if (cliente.expiraEm < new Date()) {
            return res.status(400).send("Token expirado. Faça um novo cadastro.");
        }
        
        cliente.confirmado = true;
        cliente.tokenConfirmacao = null;  // Limpa token
        cliente.expiraEm = null;
        await cliente.save();
        
        res.send(`
            <h2>Conta confirmada com sucesso!</h2>
            <p><a href="https://mirelli-pizzaria-site.vercel.app">Faça login aqui</a></p>
        `);  // Página simples de sucesso
    } catch (err) {
        res.status(500).send("Erro interno.");
    }
});

/**
 * Rota: Login
 * Acesso: Público
 * Observação: Agora o JWT inclui "cliente: true"
 */
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const cliente = await Cliente.findOne({ email });
        if (!cliente) return res.status(400).json({ error: "E-mail ou senha incorretos" });

        const senhaValida = await bcrypt.compare(senha, cliente.senha);
        if (!senhaValida) return res.status(400).json({ error: "E-mail ou senha incorretos" });

        if (!cliente.confirmado) {
            return res.status(403).json({ error: "Conta não confirmada. Verifique seu e-mail." });
        }

        // JWT atualizado com "cliente: true"
        const token = jwt.sign(
            { id: cliente._id, cliente: true },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            cliente: {
                _id: cliente._id,
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.telefone,
                endereco: cliente.endereco
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});

/**
 * Rota: Solicitar redefinição de senha
 */
router.post('/esqueci-senha', async (req, res) => {
    const { email } = req.body;

    try {
        const cliente = await Cliente.findOne({ email });
        if (!cliente) return res.status(400).json({ error: "E-mail não encontrado" });

        const codigoReset = Math.floor(100000 + Math.random() * 900000).toString();
        cliente.codigoConfirmacao = codigoReset;
        await cliente.save();

        await enviarEmailConfirmacao(email, cliente.nome, codigoReset);

        res.json({ message: "Código de redefinição enviado por e-mail." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Rota: Redefinir senha
 */
router.post('/redefinir-senha', async (req, res) => {
    const { email, codigo, novaSenha } = req.body;

    try {
        const cliente = await Cliente.findOne({ email });
        if (!cliente) return res.status(400).json({ error: "E-mail não encontrado" });

        if (cliente.codigoConfirmacao !== codigo) {
            return res.status(400).json({ error: "Código inválido" });
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10);
        cliente.senha = senhaHash;
        cliente.codigoConfirmacao = null;
        await cliente.save();

        res.json({ message: "Senha alterada com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
