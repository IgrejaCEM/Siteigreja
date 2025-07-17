const bcrypt = require('bcrypt');
const { db } = require('./database/db');

const name = 'admin';
const email = 'admin@admin.com';
const password = 'admin123';

async function createAdmin() {
  try {
    const hash = await bcrypt.hash(password, 8);
    
    await db('users').insert({
      name,
      email,
      password: hash,
      is_admin: true
    });
    
    console.log('Usuário admin criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar admin:', error.message);
  } finally {
    process.exit();
  }
}

createAdmin(); 