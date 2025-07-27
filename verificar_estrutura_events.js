const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

async function verificarEstruturaEvents() {
  console.log('🔍 Verificando estrutura da tabela events...');
  
  try {
    // Verificar colunas da tabela events
    const colunas = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'events'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Colunas da tabela events:');
    colunas.rows.forEach(coluna => {
      console.log(`   ${coluna.column_name} (${coluna.data_type}) - Nullable: ${coluna.is_nullable}`);
    });
    
    // Verificar dados existentes
    const eventos = await pool.query('SELECT * FROM events LIMIT 3;');
    console.log('\n📊 Eventos existentes:');
    eventos.rows.forEach(evento => {
      console.log(`   ID: ${evento.id} - ${evento.title}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarEstruturaEvents(); 