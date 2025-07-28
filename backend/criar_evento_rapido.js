const { db } = require('./src/database/db');

async function criarEventoRapido() {
  try {
    console.log('🚀 Criando evento de teste...');
    
    const [eventId] = await db('events').insert({
      title: 'TESTE PAGAMENTO',
      description: 'Evento para testar pagamento',
      date: '2025-12-31 19:00:00',
      location: 'Igreja CEM',
      slug: 'teste-pagamento',
      status: 'active',
      has_payment: true,
      payment_gateway: 'mercadopago'
    }).returning('id');

    const [lotId] = await db('lots').insert({
      event_id: eventId,
      name: 'LOTE TESTE',
      price: 50.00,
      quantity: 100,
      status: 'active',
      is_free: false
    }).returning('id');

    console.log('✅ Evento criado!');
    console.log(`📅 ID: ${eventId}`);
    console.log(`🎫 Lote: ${lotId}`);
    console.log(`🔗 Teste: https://igrejacemchurch.org/evento/teste-pagamento`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

criarEventoRapido(); 