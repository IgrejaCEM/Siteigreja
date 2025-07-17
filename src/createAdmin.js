const { db } = require('../backend/src/database/db');
const bcrypt = require('bcrypt');

async function createAdmin() {
  try {
    const name = 'Admin';
    const email = 'admin@example.com';
    const password = await bcrypt.hash('admin123', 10);

    // Verificar se já existe um admin
    const existingAdmin = await db('users')
      .where('email', email)
      .first();

    if (existingAdmin) {
      console.log('Admin já existe!');
      return;
    }

    // Criar admin
    await db('users').insert({
      name,
      email,
      password,
      is_admin: true,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('Admin criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  }
}

createAdmin(); 