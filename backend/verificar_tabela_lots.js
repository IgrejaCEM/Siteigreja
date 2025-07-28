const knex = require('knex')(require('./knexfile').development);

async function verificarTabelaLots() {
  try {
    console.log('🔍 VERIFICANDO ESTRUTURA DA TABELA LOTS');
    console.log('========================================');
    
    // Verificar se a tabela existe
    const tableExists = await knex.schema.hasTable('lots');
    console.log('📦 Tabela lots existe:', tableExists);
    
    if (tableExists) {
      // Obter informações da tabela
      const columns = await knex.raw("PRAGMA table_info(lots)");
      console.log('\n📋 COLUNAS DA TABELA LOTS:');
      columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
      
      // Verificar dados existentes
      const lotes = await knex('lots').select('*').limit(3);
      console.log('\n📋 LOTES EXISTENTES (primeiros 3):');
      lotes.forEach(lote => {
        console.log(`  - ID: ${lote.id}, Nome: ${lote.name}, Preço: ${lote.price}, Evento: ${lote.event_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
  } finally {
    await knex.destroy();
  }
}

verificarTabelaLots(); 