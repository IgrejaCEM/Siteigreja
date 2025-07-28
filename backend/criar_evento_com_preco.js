const { db } = require('./src/database/db');

async function criarEventoComPreco() {
  try {
    console.log('🎯 Criando evento com preço para teste...');
    
    // Verificar se já existe um evento com preço
    const eventoExistente = await db('events')
      .where('title', 'like', '%TESTE PREÇO%')
      .first();
    
    if (eventoExistente) {
      console.log('✅ Evento de teste já existe:', eventoExistente.title);
      return eventoExistente;
    }
    
    // Criar evento com preço
    const [eventoId] = await db('events').insert({
      title: 'EVENTO TESTE PREÇO - CONNECT CONF 2025',
      description: 'Evento de teste com preço para verificar checkout',
      date: '2025-10-24 19:00:00',
      location: 'Igreja CEM - Cajati/SP',
      price: 60,
      banner: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
      banner_home: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
      banner_evento: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
      slug: 'evento-teste-preco',
      status: 'active',
      has_payment: true,
      payment_gateway: 'mercadopago'
    }).returning('id');
    
    console.log('✅ Evento criado com ID:', eventoId);
    
    // Criar lote com preço
    const [loteId] = await db('lots').insert({
      event_id: eventoId,
      name: 'LOTE TESTE - R$ 60,00',
      price: 60,
      quantity: 100,
      start_date: '2025-01-01 00:00:00',
      end_date: '2025-10-23 23:59:59',
      status: 'active',
      is_free: false
    }).returning('id');
    
    console.log('✅ Lote criado com ID:', loteId);
    
    console.log('🎉 Evento de teste criado com sucesso!');
    console.log('📋 URL para teste: https://igrejacemchurch.org/inscricao/evento-teste-preco');
    
    return { eventoId, loteId };
    
  } catch (error) {
    console.error('❌ Erro ao criar evento:', error);
  }
}

criarEventoComPreco(); 