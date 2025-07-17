const { db } = require('./database/db');

async function promoteAdmin(email) {
  try {
    const updated = await db('users')
      .where('email', email)
      .update('is_admin', true);
    
    if (updated) {
      console.log(`Usuário ${email} promovido a admin com sucesso!`);
    } else {
      console.log(`Usuário ${email} não encontrado.`);
    }
  } catch (error) {
    console.error('Erro ao promover usuário:', error);
  } finally {
    process.exit();
  }
}

// Pegar email do argumento da linha de comando
const email = process.argv[2];
if (!email) {
  console.error('Por favor forneça um email como argumento.');
  process.exit(1);
}

promoteAdmin(email); 