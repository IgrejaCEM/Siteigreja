const bcrypt = require('bcrypt');
const { db } = require('./src/database/db');

async function testLogin() {
  try {
    console.log('Testando login...');
    
    // Verificar se há usuários no banco
    const users = await db('users').select('*');
    console.log('Usuários no banco:', users.length);
    
    if (users.length > 0) {
      console.log('Primeiro usuário:', {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        is_admin: users[0].is_admin
      });
      
      // Testar login com admin@admin.com
      const user = await db('users')
        .where('email', 'admin@admin.com')
        .first();
      
      if (user) {
        console.log('Usuário admin encontrado!');
        console.log('Testando senha...');
        
        const validPassword = await bcrypt.compare('admin', user.password);
        console.log('Senha válida:', validPassword);
        
        if (validPassword) {
          console.log('Login deve funcionar!');
        } else {
          console.log('Senha incorreta!');
        }
      } else {
        console.log('Usuário admin não encontrado!');
      }
    } else {
      console.log('Nenhum usuário no banco!');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    process.exit(0);
  }
}

testLogin(); 