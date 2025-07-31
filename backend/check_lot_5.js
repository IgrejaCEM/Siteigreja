const { db } = require('./src/database/db');

async function checkLot5() {
  try {
    console.log('🔍 Verificando lote 5...');
    
    const lot = await db('lots')
      .where('id', 5)
      .first();
    
    if (lot) {
      console.log('✅ Lote 5 encontrado:');
      console.log('   ID:', lot.id);
      console.log('   Nome:', lot.name);
      console.log('   Preço:', lot.price);
      console.log('   Evento ID:', lot.event_id);
      console.log('   Ativo:', lot.active);
    } else {
      console.log('❌ Lote 5 não encontrado');
    }
    
    // Verificar todos os lotes do evento 14
    console.log('\n🔍 Verificando todos os lotes do evento 14...');
    const lots = await db('lots')
      .where('event_id', 14)
      .select('*');
    
    console.log('📊 Lotes do evento 14:');
    lots.forEach(lot => {
      console.log(`   ID: ${lot.id}, Nome: ${lot.name}, Preço: ${lot.price}, Ativo: ${lot.active}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(0);
  }
}

checkLot5(); 