const { db } = require('./src/database/db');

async function checkAllLots() {
  try {
    console.log('🔍 Verificando todos os lotes...');
    
    const lots = await db('lots')
      .select('*')
      .orderBy('event_id')
      .orderBy('id');
    
    console.log('📊 Todos os lotes:');
    lots.forEach(lot => {
      console.log(`   ID: ${lot.id}, Evento: ${lot.event_id}, Nome: ${lot.name}, Preço: ${lot.price}, Ativo: ${lot.active}`);
    });
    
    if (lots.length === 0) {
      console.log('❌ Nenhum lote encontrado no banco!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAllLots(); 