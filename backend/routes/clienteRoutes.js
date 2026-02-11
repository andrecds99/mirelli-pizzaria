const express = require('express');
const router = express.Router();
const Cliente = require('../models/cliente');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const enviarEmailConfirmacao = require('../middlewares/emailMiddleware');

/**
 * Rota: Cadastro de cliente
 * Acesso: Público
 */
router.post('/cadastro', async (req, res) => {
    const { nome, email, senha, telefone, endereco } = req.body;

    try {
        const clienteExistente = await Cliente.findOne({ email });
        if (clienteExistente) {
            return res.status(400).json({ error: "E-mail já cadastrado" });
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        const codigoConfirmacao = Math.floor(100000 + Math.random() * 900000).toString();

        const novoCliente = new Cliente({
            nome,
            email,
            senha: senhaHash,
            telefone,
            endereco,
            confirmado: false,
            codigoConfirmacao
        });

        await novoCliente.save();
        await enviarEmailConfirmacao(email, nome, codigoConfirmacao);

        res.status(201).json({
            message: "Cliente cadastrado com sucesso. Verifique seu e-mail para confirmação."
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Rota: Confirmação de cadastro
 * Acesso: Público
 */
router.post('/confirmar', async (req, res) => {
    const { email, codigo } = req.body;

    try {
        const cliente = await Cliente.findOne({ email });
        if (!cliente) return res.status(400).json({ error: "E-mail não encontrado" });


        // 🔧 MELHORIA: Normalize a comparação (remova espaços e converta para string)
        const codigoSalvo = String(cliente.codigoConfirmacao).trim();
        const codigoEnviado = String(codigo).trim();

        if (codigoSalvo !== codigoEnviado) {
            return res.status(400).json({ error: "Código de confirmação inválido" });
        }

        // 🔧 ADIÇÃO: Verifique expiração se implementada
        if (cliente.expiraEm && cliente.expiraEm < new Date()) {
            return res.status(400).json({ error: "Código expirado. Solicite um novo." });
        }

        cliente.confirmado = true;
        cliente.codigoConfirmacao = null;  // Limpe o código após confirmação
        cliente.expiraEm = null;  // Limpe expiração se existir
        await cliente.save();

        res.json({ message: "Conta confirmada com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
