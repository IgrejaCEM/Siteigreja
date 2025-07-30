const knex = require('knex');
const knexConfig = require('../../knexfile');

async function checkSettingsColumns() {
  let db;
  try {
    console.log('🔍 Verificando colunas da tabela settings...');
    
    db = knex(knexConfig.production);
    
    // Verificar estrutura da tabela
    const columns = await db.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'settings'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colunas encontradas:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Verificar conteúdo atual
    const settings = await db('settings').first();
    console.log('📝 Conteúdo atual:', settings);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (db) {
      await db.destroy();
    }
    process.exit(0);
  }
}

checkSettingsColumns(); 