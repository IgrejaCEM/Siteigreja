const knex = require('knex');
const knexConfig = require('../../knexfile');

async function testProductionDB() {
  let db;
  try {
    console.log('🔍 Testando conexão com banco de produção...');
    
    db = knex(knexConfig.production);
    
    // Testar conexão
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Conexão OK:', result.rows);
    
    // Verificar se a tabela settings existe
    const hasSettings = await db.schema.hasTable('settings');
    console.log('📋 Tabela settings existe:', hasSettings);
    
    if (hasSettings) {
      const settings = await db('settings').first();
      console.log('📝 Conteúdo atual:', settings ? 'Existe' : 'Não existe');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (db) {
      await db.destroy();
    }
    process.exit(0);
  }
}

testProductionDB(); 