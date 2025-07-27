const bcrypt = require('bcrypt');
const { db } = require('./src/database/db');

async function testAdminLogin() {
  try {
    console.log('🔍 Testando login do admin...');
    
    // Verificar se há usuários no banco
    const users = await db('users').select('*');
    console.log(`📊 Total de usuários no banco: ${users.length}`);
    
    if (users.length > 0) {
      console.log('👥 Usuários encontrados:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}, Email: ${user.email}, Admin: ${user.is_admin}`);
      });
    }
    
    // Buscar especificamente o admin
    const admin = await db('users')
      .where('email', 'admin@admin.com')
      .first();
    
    if (!admin) {
      console.log('❌ Usuário admin@admin.com não encontrado!');
      console.log('🔧 Criando usuário admin...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const [newAdmin] = await db('users').insert({
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        is_admin: true
      }).returning('*');
      
      console.log('✅ Usuário admin criado com sucesso!');
      console.log('📝 Credenciais:');
      console.log('   Email: admin@admin.com');
      console.log('   Senha: admin123');
      
      return;
    }
    
    console.log('✅ Usuário admin encontrado!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Nome: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   É admin: ${admin.is_admin}`);
    
    // Testar a senha
    console.log('🔐 Testando senha...');
    const testPasswords = ['admin123', 'admin', '123456'];
    
    for (const password of testPasswords) {
      const isValid = await bcrypt.compare(password, admin.password);
      console.log(`   Senha "${password}": ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
      
      if (isValid) {
        console.log('🎉 Login deve funcionar com essas credenciais!');
        console.log(`   Email: admin@admin.com`);
        console.log(`   Senha: ${password}`);
        break;
      }
    }
    
    // Se nenhuma senha funcionou, resetar para admin123
    const admin123Valid = await bcrypt.compare('admin123', admin.password);
    if (!admin123Valid) {
      console.log('🔄 Resetando senha para admin123...');
      const newHash = await bcrypt.hash('admin123', 10);
      await db('users')
        .where('email', 'admin@admin.com')
        .update({
          password: newHash,
          is_admin: true
        });
      
      console.log('✅ Senha resetada com sucesso!');
      console.log('📝 Use as credenciais:');
      console.log('   Email: admin@admin.com');
      console.log('   Senha: admin123');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await db.destroy();
    console.log('🔚 Conexão com banco fechada.');
  }
}

testAdminLogin(); 