const nodemailer = require('nodemailer');

// Configuração: coloque as credenciais reais depois
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'seu-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'senha-de-app-ou-smtp'
  }
});

async function sendComprovanteEmail({ to, nome, evento, lote, status, qrCode, linhaDigitavel }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Simulação de envio de e-mail] Para:', to, '| Evento:', evento, '| Lote:', lote, '| Status:', status);
    return;
  }
  const html = `
    <h2>Comprovante de Inscrição</h2>
    <p>Olá, <b>${nome}</b>!</p>
    <p>Sua inscrição no evento <b>${evento}</b> foi registrada.</p>
    <p><b>Lote:</b> ${lote}</p>
    <p><b>Status do pagamento:</b> ${status}</p>
    ${qrCode ? `<p><b>Pix:</b><br/><img src='${qrCode}' alt='QR Code Pix' /></p>` : ''}
    ${linhaDigitavel ? `<p><b>Boleto:</b> ${linhaDigitavel}</p>` : ''}
    <p>Obrigado por participar!</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `Comprovante de Inscrição - ${evento}`,
    html
  });
}

module.exports = { sendComprovanteEmail }; 