const { db } = require('./src/database/db');

async function checkLots() {
  try {
    console.log('🔍 Verificando lotes existentes...');
    
    const lots = await db('lots').select('*');
    console.log('📊 Total de lotes:', lots.length);
    
    console.log('📋 Lotes encontrados:');
    lots.forEach((lot, index) => {
      console.log(`  ${index + 1}. ID: ${lot.id} | Nome: ${lot.name} | Preço: R$ ${lot.price} | Evento: ${lot.event_id}`);
    });
    
    // Verificar lotes do evento 14
    console.log('\n🔍 Lotes do evento 14:');
    const eventLots = await db('lots').where('event_id', 14).select('*');
    console.log('📊 Total de lotes do evento 14:', eventLots.length);
    
    eventLots.forEach((lot, index) => {
      console.log(`  ${index + 1}. ID: ${lot.id} | Nome: ${lot.name} | Preço: R$ ${lot.price}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkLots(); 