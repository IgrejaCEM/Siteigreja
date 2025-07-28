const knex = require('knex')(require('./knexfile').development);

async function verificarTabelaEvents() {
  try {
    console.log('🔍 VERIFICANDO ESTRUTURA DA TABELA EVENTS');
    console.log('==========================================');
    
    // Verificar se a tabela existe
    const tableExists = await knex.schema.hasTable('events');
    console.log('📦 Tabela events existe:', tableExists);
    
    if (tableExists) {
      // Obter informações da tabela
      const columns = await knex.raw("PRAGMA table_info(events)");
      console.log('\n📋 COLUNAS DA TABELA EVENTS:');
      columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
      
      // Verificar dados existentes
      const eventos = await knex('events').select('*').limit(3);
      console.log('\n📋 EVENTOS EXISTENTES (primeiros 3):');
      eventos.forEach(evento => {
        console.log(`  - ID: ${evento.id}, Título: ${evento.title}, Status: ${evento.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
  } finally {
    await knex.destroy();
  }
}

verificarTabelaEvents(); 