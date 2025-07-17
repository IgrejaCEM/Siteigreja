const bcrypt = require('bcrypt');
const { db } = require('../database/db');

async function ensureAdminUser() {
  try {
    // Verificar se o usuário admin existe
    const adminUser = await db('users')
      .where('email', 'admin@admin.com')
      .first();

    if (!adminUser) {
      // Criar usuário admin
      const hashedPassword = await bcrypt.hash('admin123', 8);
      await db('users').insert({
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        is_admin: true
      });
      console.log('✅ Usuário admin criado com sucesso!');
    } else {
      // Garantir que o usuário tem privilégios de admin
      await db('users')
        .where('email', 'admin@admin.com')
        .update({
          is_admin: true
        });
      console.log('✅ Privilégios de admin verificados e atualizados!');
    }

    // Verificar se o usuário foi criado/atualizado corretamente
    const user = await db('users')
      .where('email', 'admin@admin.com')
      .first();
    
    console.log('Usuário admin:', {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin
    });

  } catch (error) {
    console.error('❌ Erro ao configurar usuário admin:', error);
    process.exit(1);
  }
}

// Executar o script
ensureAdminUser(); 