const bcrypt = require('bcrypt');
const { db } = require('./backend/src/database/db');

async function verificarAdmin() {
  try {
    console.log('🔍 Verificando usuário admin...');
    
    // Verificar se existe usuário admin
    const admin = await db('users')
      .where('email', 'admin@admin.com')
      .first();
    
    if (!admin) {
      console.log('❌ Usuário admin não encontrado!');
      console.log('🔧 Criando usuário admin...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db('users').insert({
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        is_admin: true
      });
      
      console.log('✅ Usuário admin criado com sucesso!');
      console.log('📝 Credenciais:');
      console.log('   Email: admin@admin.com');
      console.log('   Senha: admin123');
    } else {
      console.log('✅ Usuário admin encontrado!');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Nome: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   É admin: ${admin.is_admin}`);
      
      // Garantir que é admin
      if (!admin.is_admin) {
        await db('users')
          .where('email', 'admin@admin.com')
          .update({ is_admin: true });
        console.log('✅ Privilégios de admin garantidos!');
      }
      
      console.log('📝 Use as credenciais:');
      console.log('   Email: admin@admin.com');
      console.log('   Senha: admin123');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
  }
}

verificarAdmin(); 