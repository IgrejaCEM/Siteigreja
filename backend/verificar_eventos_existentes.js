const { db } = require('./src/database/db');

console.log('🔍 VERIFICANDO EVENTOS EXISTENTES');
console.log('==================================');

async function verificarEventos() {
  try {
    console.log('📋 Buscando todos os eventos...');
    
    const events = await db('events')
      .select('id', 'title', 'slug', 'status', 'has_payment', 'payment_gateway')
      .orderBy('id', 'asc');
    
    console.log(`✅ Encontrados ${events.length} eventos:`);
    
    events.forEach(event => {
      console.log(`📅 ID: ${event.id} | ${event.title}`);
      console.log(`   Slug: ${event.slug}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Pagamento: ${event.has_payment ? 'Sim' : 'Não'}`);
      console.log(`   Gateway: ${event.payment_gateway || 'N/A'}`);
      console.log('---');
    });
    
    // Verificar lotes de cada evento
    for (const event of events) {
      console.log(`\n📦 Lotes do evento ${event.id} (${event.title}):`);
      
      const lots = await db('lots')
        .where('event_id', event.id)
        .select('id', 'name', 'price', 'quantity', 'status', 'is_free')
        .orderBy('price', 'asc');
      
      lots.forEach(lot => {
        console.log(`   🎫 ID: ${lot.id} | ${lot.name} | R$ ${lot.price} | Qtd: ${lot.quantity} | Status: ${lot.status} | Grátis: ${lot.is_free ? 'Sim' : 'Não'}`);
      });
    }
    
    // Verificar inscrições
    console.log('\n📊 Inscrições por evento:');
    for (const event of events) {
      const registrations = await db('registrations')
        .where('event_id', event.id)
        .count('id as count')
        .first();
      
      console.log(`   Evento ${event.id}: ${registrations.count} inscrições`);
    }
    
    console.log('\n🎯 RECOMENDAÇÃO:');
    console.log('Use o ID do evento que tem pagamento habilitado para testar');
    
  } catch (error) {
    console.error('❌ Erro ao verificar eventos:', error);
  }
}

verificarEventos(); 