async function enviarEmailConfirmacao(email, nome, token) {
  const linkConfirmacao = `https://mirelli-pizzaria-site.vercel.app/confirmar-token?token=${token}`;
  
  const msg = {
    to: email,
    from: 'mirellipizaria1@gmail.com',
    subject: 'Confirme seu cadastro na Mirelli Pizzaria',
    html: `
      <h2>Olá, ${nome}!</h2>
      <p>Obrigado por se cadastrar na Mirelli Pizzaria.</p>
      <p>Clique no link abaixo para confirmar sua conta:</p>
      <p><a href="${linkConfirmacao}" style="background-color: #4CAF50; color: white; padding: 10px; text-decoration: none;">Confirmar Cadastro</a></p>
      <p>Este link expira em 24 horas.</p>
      <p>Se você não solicitou, ignore este e-mail.</p>
      <br>
      <p>Equipe Mirelli Pizzaria</p>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`E-mail enviado para ${email}`);
  } catch (error) {
    console.error('Erro no SendGrid:', error.message);
    throw new Error('Falha no envio de e-mail');
  }
}

module.exports = { enviarEmailConfirmacao };  