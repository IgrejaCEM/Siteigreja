const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

async function verificarTodasTabelas() {
  console.log('🔍 Verificando todas as tabelas no PostgreSQL Railway...');
  
  try {
    // Listar todas as tabelas
    const tabelas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Todas as tabelas encontradas:');
    tabelas.rows.forEach(tabela => {
      console.log(`   ✅ ${tabela.table_name}`);
    });
    
    // Verificar tabelas essenciais
    const tabelasEssenciais = [
      'users',
      'events', 
      'lots',
      'registrations',
      'payments',
      'transactions',
      'event_products',
      'registration_products',
      'settings'
    ];
    
    console.log('\n🔍 Verificando tabelas essenciais:');
    for (const tabela of tabelasEssenciais) {
      const existe = tabelas.rows.some(t => t.table_name === tabela);
      console.log(`   ${existe ? '✅' : '❌'} ${tabela}`);
    }
    
    // Verificar dados nas tabelas principais
    console.log('\n📊 Dados nas tabelas principais:');
    
    const users = await pool.query('SELECT COUNT(*) as count FROM users;');
    console.log(`   👥 Users: ${users.rows[0].count}`);
    
    const events = await pool.query('SELECT COUNT(*) as count FROM events;');
    console.log(`   📅 Events: ${events.rows[0].count}`);
    
    const lots = await pool.query('SELECT COUNT(*) as count FROM lots;');
    console.log(`   🎫 Lots: ${lots.rows[0].count}`);
    
    const registrations = await pool.query('SELECT COUNT(*) as count FROM registrations;');
    console.log(`   📝 Registrations: ${registrations.rows[0].count}`);
    
    const payments = await pool.query('SELECT COUNT(*) as count FROM payments;');
    console.log(`   💰 Payments: ${payments.rows[0].count}`);
    
    const transactions = await pool.query('SELECT COUNT(*) as count FROM transactions;');
    console.log(`   💳 Transactions: ${transactions.rows[0].count}`);
    
    // Verificar estrutura da tabela registrations
    console.log('\n🔍 Estrutura da tabela registrations:');
    const colunasRegistrations = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'registrations'
      ORDER BY ordinal_position;
    `);
    
    colunasRegistrations.rows.forEach(coluna => {
      console.log(`   ${coluna.column_name} (${coluna.data_type}) - Nullable: ${coluna.is_nullable}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarTodasTabelas(); 