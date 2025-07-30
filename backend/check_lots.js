const { db } = require('./src/database/db');

async function checkLots() {
  try {
    console.log('🔍 Verificando lotes no banco de dados...');
    
    const lots = await db('lots').select('*');
    console.log('📊 Lotes encontrados:', lots);
    
    if (lots.length === 0) {
      console.log('⚠️ Nenhum lote encontrado no banco de dados');
    } else {
      console.log('✅ Lotes disponíveis:');
      lots.forEach(lot => {
        console.log(`   - ID: ${lot.id}, Nome: ${lot.name}, Preço: R$ ${lot.price}, Evento: ${lot.event_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar lotes:', error);
  } finally {
    process.exit(0);
  }
}

checkLots(); 