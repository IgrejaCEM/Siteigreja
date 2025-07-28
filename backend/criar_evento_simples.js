const { db } = require('./src/database/db');

async function criarEventoSimples() {
  try {
    console.log('🚀 Criando evento simples...');
    
    // Deletar eventos de teste antigos
    await db('events').where('title', 'LIKE', '%TESTE%').del();
    console.log('🗑️ Eventos de teste antigos removidos');
    
    // Criar evento
    const [eventId] = await db('events').insert({
      title: 'TESTE PAGAMENTO SIMPLES',
      description: 'Evento para testar pagamento',
      date: '2025-12-31 19:00:00',
      location: 'Igreja CEM',
      slug: 'teste-pagamento-simples',
      status: 'active',
      has_payment: true,
      payment_gateway: 'mercadopago'
    }).returning('id');

    // Criar lote
    const [lotId] = await db('lots').insert({
      event_id: eventId,
      name: 'LOTE SIMPLES',
      price: 10.00,
      quantity: 50,
      status: 'active',
      is_free: false
    }).returning('id');

    console.log('✅ Evento criado!');
    console.log(`📅 ID: ${eventId}`);
    console.log(`🎫 Lote: ${lotId}`);
    console.log(`🔗 URL: https://igrejacemchurch.org/evento/teste-pagamento-simples`);
    console.log(`💰 Valor: R$ 10,00`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

criarEventoSimples(); 