const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway'
});

async function checkStructure() {
  try {
    console.log('🔍 Conectando ao banco...');
    await client.connect();
    
    console.log('📋 Verificando estrutura da tabela settings...');
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'settings'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colunas encontradas:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('📝 Verificando conteúdo atual...');
    const content = await client.query('SELECT * FROM settings LIMIT 1');
    console.log('📝 Conteúdo:', content.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkStructure(); 