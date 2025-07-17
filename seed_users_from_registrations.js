const { db } = require('./backend/src/database/db');

async function seedUsersFromRegistrations() {
  try {
    const registrations = await db('registrations').select('*');
    
    for (const registration of registrations) {
      // Criar usuário se não existir
      const existingUser = await db('users')
        .where('email', registration.email)
        .first();
      
      if (!existingUser) {
        await db('users').insert({
          name: registration.name,
          email: registration.email,
          password: 'senha123', // Senha padrão
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
    
    console.log('Usuários criados com sucesso!');
  } catch (error) {
    console.error('Erro ao criar usuários:', error);
  }
}

seedUsersFromRegistrations(); 