const bcrypt = require('bcrypt');
const { db } = require('./src/database/db');

async function resetAdminPassword() {
  try {
    const hash = await bcrypt.hash('admin', 10);
    const updated = await db('users')
      .where('email', 'admin@admin.com')
      .update({ password: hash });
    if (updated) {
      console.log('Senha do admin resetada para "admin" com sucesso!');
    } else {
      console.log('Usuário admin não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
  } finally {
    process.exit(0);
  }
}

resetAdminPassword(); 