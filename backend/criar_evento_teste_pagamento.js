const { db } = require('./src/database/db');

console.log('🎯 CRIANDO EVENTO DE TESTE COM PAGAMENTO');
console.log('==========================================');

async function criarEventoTeste() {
  try {
    console.log('📋 Verificando eventos existentes...');
    
    const existingEvents = await db('events').count('id as count').first();
    console.log(`📊 Eventos existentes: ${existingEvents.count}`);
    
    // Criar evento de teste
    console.log('\n📝 Criando evento de teste...');
    
    const [eventId] = await db('events').insert({
      title: 'EVENTO TESTE PAGAMENTO',
      description: 'Evento para testar pagamento via Mercado Pago',
      date: '2025-12-31 19:00:00',
      location: 'Igreja CEM - São Paulo',
      banner: 'https://via.placeholder.com/1200x400?text=Evento+Teste',
      banner_home: 'https://via.placeholder.com/1200x400?text=Evento+Teste',
      banner_evento: 'https://via.placeholder.com/1200x400?text=Evento+Teste',
      slug: 'evento-teste-pagamento',
      status: 'active',
      has_payment: true,
      payment_gateway: 'mercadopago',
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');

    console.log('✅ Evento criado com ID:', eventId);

    // Criar lote pago
    console.log('\n📦 Criando lote pago...');
    
    const [lotId] = await db('lots').insert({
      event_id: eventId,
      name: 'LOTE PAGO TESTE',
      price: 50.00,
      quantity: 100,
      start_date: '2025-01-01 00:00:00',
      end_date: '2025-12-31 23:59:59',
      status: 'active',
      is_free: false,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');

    console.log('✅ Lote criado com ID:', lotId);

    // Verificar evento criado
    console.log('\n📋 Verificando evento criado...');
    
    const event = await db('events')
      .where('id', eventId)
      .select('*')
      .first();
    
    const lots = await db('lots')
      .where('event_id', eventId)
      .select('*');
    
    console.log('✅ Evento:', event.title);
    console.log('💰 Preço:', event.price);
    console.log('🎫 Lotes:', lots.length);
    lots.forEach(lot => {
      console.log(`   - ${lot.name}: R$ ${lot.price} (${lot.quantity} vagas)`);
    });

    console.log('\n🎯 EVENTO CRIADO COM SUCESSO!');
    console.log(`📅 ID do Evento: ${eventId}`);
    console.log(`🎫 ID do Lote: ${lotId}`);
    console.log(`🔗 URL para teste: https://igrejacemchurch.org/evento/${event.slug}`);
    console.log(`💰 Valor: R$ 50,00`);
    
    console.log('\n📋 Para testar via API:');
    console.log(`POST /api/events/${eventId}/inscricao-unificada`);
    console.log(`Com lot_id: ${lotId}`);

  } catch (error) {
    console.error('❌ Erro ao criar evento:', error);
  }
}

criarEventoTeste(); 