const db = require('./database/db');

async function resetDatabase() {
  try {
    // Deletar todos os usuários
    await db('users').del();
    console.log('Banco de dados limpo com sucesso!');

    // Criar usuário admin
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('admin123', 8);
    
    await db('users').insert({
      name: 'admin',
      email: 'admin',
      password: hash,
      is_admin: true
    });
    
    console.log('Usuário admin criado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao resetar banco de dados:', error);
    process.exit(1);
  }
}

resetDatabase(); 