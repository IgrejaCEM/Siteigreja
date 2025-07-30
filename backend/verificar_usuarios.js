const knex = require('knex');

// Configuração PostgreSQL (produção)
const db = knex({
  client: 'pg',
  connection: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway'
});

async function verificarUsuarios() {
  console.log('👥 VERIFICANDO USUÁRIOS NO BANCO');
  console.log('==================================');
  
  try {
    // 1. Verificar se a tabela users existe
    console.log('📋 [1/3] Verificando tabela users...');
    const hasUsersTable = await db.schema.hasTable('users');
    console.log(`📊 Tabela users existe: ${hasUsersTable}`);
    
    if (!hasUsersTable) {
      console.log('❌ Tabela users não existe!');
      return;
    }
    
    // 2. Listar todos os usuários
    console.log('📋 [2/3] Listando usuários...');
    const usuarios = await db('users').select('*').orderBy('id');
    console.log(`📊 Total de usuários: ${usuarios.length}`);
    
    if (usuarios.length > 0) {
      console.log('📋 Usuários encontrados:');
      usuarios.forEach((usuario, index) => {
        console.log(`  ${index + 1}. ID: ${usuario.id} | Nome: ${usuario.name} | Email: ${usuario.email} | Admin: ${usuario.is_admin}`);
      });
    } else {
      console.log('❌ Nenhum usuário encontrado!');
    }
    
    // 3. Verificar usuário admin específico
    console.log('📋 [3/3] Verificando usuário admin...');
    const adminUser = await db('users').where('email', 'admin@admin.com').first();
    
    if (adminUser) {
      console.log('✅ Usuário admin encontrado:');
      console.log(`  - ID: ${adminUser.id}`);
      console.log(`  - Nome: ${adminUser.name}`);
      console.log(`  - Email: ${adminUser.email}`);
      console.log(`  - Admin: ${adminUser.is_admin}`);
    } else {
      console.log('❌ Usuário admin não encontrado!');
      
      // Criar usuário admin se não existir
      console.log('📋 Criando usuário admin...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const [newAdmin] = await db('users').insert({
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        is_admin: true,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');
      
      console.log(`✅ Usuário admin criado com ID: ${newAdmin.id}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await db.destroy();
  }
}

verificarUsuarios(); 