const nodemailer = require("nodemailer");

async function enviarEmailConfirmacao(email, nome, codigo) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Confirmação de cadastro - Mirelli Pizzaria",
            html: `
                <h2>Olá, ${nome}</h2>
                <p>Obrigado por se cadastrar no site da Mirelli Pizzaria.</p>
                <p>Seu código de confirmação é: <b>${codigo}</b></p>
                <p>Ou clique no link abaixo para confirmar sua conta:</p>
                <a href="${process.env.FRONTEND_URL}/confirmar/${codigo}">Confirmar cadastro</a>
                <p>Se não reconhece este cadastro, ignore este e-mail.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ E-mail enviado com sucesso");
    } catch (err) {
        console.error("❌ Erro ao enviar e-mail:", err);
    }
}

module.exports = enviarEmailConfirmacao;
