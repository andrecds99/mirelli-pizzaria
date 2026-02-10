const nodemailer = require('nodemailer');

const transport = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  
  },
 
  pool: true,  // Usa pool de conexões
  maxConnections: 1,
  rateDelta: 20000,  // Delay entre e-mails
  rateLimit: 5,      // Limite de e-mails por segundo
  tls: {
    rejectUnauthorized: false  // Para evitar erros de certificado 
  }
});

async function enviarEmailConfirmacao(email, nome, codigo) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirme seu cadastro na Mirelli Pizzaria',
    html: `
      <h2>Olá, ${nome}!</h2>
      <p>Código: <strong>${codigo}</strong></p>
      <!-- Mesmo HTML de antes -->
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error.message);
    throw error;
  }
}

module.exports = enviarEmailConfirmacao;