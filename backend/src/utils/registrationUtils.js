// backend/src/utils/registrationUtils.js

// Função para gerar um código de inscrição único (exemplo simples)
async function generateRegistrationCode() {
  // Gera um código aleatório de 8 caracteres (ajuste conforme sua necessidade)
  const code = Math.random().toString(36).substr(2, 8).toUpperCase();
  return code;
}

module.exports = {
  generateRegistrationCode
}; 