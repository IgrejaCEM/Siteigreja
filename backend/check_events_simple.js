const { db } = require('./src/database/db');

async function checkEvents() {
  try {
    console.log('🔍 Verificando eventos...');
    
    const events = await db('events').select('*');
    console.log(`📊 Total: ${events.length} eventos`);
    
    events.forEach(event => {
      console.log(`ID: ${event.id} | ${event.title} | Pagamento: ${event.has_payment ? 'Sim' : 'Não'}`);
    });
    
    // Encontrar evento com pagamento
    const eventoComPagamento = events.find(e => e.has_payment);
    
    if (eventoComPagamento) {
      console.log(`\n💰 Evento com pagamento: ${eventoComPagamento.title} (ID: ${eventoComPagamento.id})`);
      
      const lots = await db('lots').where('event_id', eventoComPagamento.id).select('*');
      console.log('📦 Lotes:');
      lots.forEach(lot => {
        console.log(`  - ${lot.name}: R$ ${lot.price}`);
      });
      
      console.log(`\n🔗 URL: https://igrejacemchurch.org/evento/${eventoComPagamento.slug}`);
    } else {
      console.log('\n❌ Nenhum evento com pagamento encontrado!');
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

checkEvents(); 