const bcrypt = require('bcrypt');
const { db, initializeDatabase } = require('./database/db');

async function createAdminUser() {
  try {
    await initializeDatabase();
    
    // Atualizar senha do admin
    const hashedPassword = await bcrypt.hash('admin123', 8);
    await db('users')
      .where('email', 'admin@admin.com')
      .update({
        password: hashedPassword,
        is_admin: true
      });
    console.log('Senha do usuário admin atualizada!');

    // Verificar se o usuário foi atualizado
    const user = await db('users')
      .where('email', 'admin@admin.com')
      .first();
    
    console.log('Usuário admin:', user);

    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar usuário admin:', error);
    process.exit(1);
  }
}

createAdminUser(); 