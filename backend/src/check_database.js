const { db, initializeDatabase } = require('./database/db');

async function checkDatabase() {
  try {
    // Inicializar banco de dados
    await initializeDatabase();

    // Verificar usuário admin
    const admin = await db('users')
      .where('email', 'admin@admin.com')
      .first();

    if (!admin) {
      console.log('Criando usuário admin...');
      await db('users').insert({
        name: 'Admin',
        email: 'admin@admin.com',
        password: '$2b$08$YQtXxw3qJVIPxLop4FNcUOGP1zC4lF0.qYzKXLmVqFf.XCdC1fIYi', // admin123
        is_admin: true
      });
      console.log('Usuário admin criado com sucesso!');
    } else {
      await db('users')
        .where('email', 'admin@admin.com')
        .update({ is_admin: true });
      console.log('Usuário admin já existe, privilégios de admin garantidos!');
    }

    // Verificar tabelas
    const tables = ['users', 'events', 'lots', 'registrations', 'payments', 'cupons', 'home_content'];
    for (const table of tables) {
      const exists = await db.schema.hasTable(table);
      console.log(`Tabela ${table}: ${exists ? 'OK' : 'NÃO EXISTE'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
    process.exit(1);
  }
}

checkDatabase(); 