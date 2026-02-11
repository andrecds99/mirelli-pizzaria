const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);  // Chave do SendGrid

async function enviarEmailConfirmacao(email, nome, codigo) {
  const msg = {
    to: email,
    from: 'mirellipizaria1@gmail.com', 
    subject: 'Confirme seu cadastro na Mirelli Pizzaria',
    html: `
      <h2>Olá, ${nome}!</h2>
      <p>Obrigado por se cadastrar na Mirelli Pizzaria.</p>
      <p>Seu código de confirmação é: <strong>${codigo}</strong></p>
      <p>Insira este código no site para ativar sua conta.</p>
      <p>Se você não solicitou este cadastro, ignore este e-mail.</p>
      <br>
      <p>Atenciosamente,<br>Equipe Mirelli Pizzaria</p>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`E-mail enviado para ${email} via SendGrid`);
  } catch (error) {
    console.error('Erro ao enviar e-mail via SendGrid:', error.message);
    throw new Error('Falha no envio de e-mail');
  }
}

module.exports = enviarEmailConfirmacao;