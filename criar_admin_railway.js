const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

async function criarAdminRailway() {
  console.log('🔧 Criando usuário admin no PostgreSQL Railway...');
  
  try {
    // Verificar se já existe usuário admin
    const adminExistente = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@admin.com']);
    
    if (adminExistente.rows.length > 0) {
      console.log('ℹ️ Usuário admin já existe');
      return;
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Criar usuário admin
    const adminResult = await pool.query(`
      INSERT INTO users (name, email, password, is_admin, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, is_admin;
    `, [
      'Admin',
      'admin@admin.com',
      hashedPassword,
      true,
      new Date(),
      new Date()
    ]);
    
    const admin = adminResult.rows[0];
    console.log('✅ Usuário admin criado com sucesso!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Nome: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Admin: ${admin.is_admin}`);
    
    // Verificar se foi criado
    const adminVerificado = await pool.query('SELECT COUNT(*) as count FROM users;');
    console.log(`\n📊 Total de usuários: ${adminVerificado.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
  } finally {
    await pool.end();
  }
}

criarAdminRailway(); 