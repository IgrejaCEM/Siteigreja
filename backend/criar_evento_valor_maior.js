const knex = require('knex')(require('./knexfile').development);

async function criarEventoValorMaior() {
  try {
    console.log('🎯 CRIANDO EVENTO COM VALOR MAIOR PARA TESTE');
    console.log('==============================================');
    
    // Criar evento
    const [eventoId] = await knex('events').insert({
      title: 'EVENTO TESTE VALOR MAIOR',
      description: 'Evento para testar pagamentos com valor maior',
      date: '2025-08-15',
      location: 'Igreja CEM Cajati',
      price: 50.00,  // Valor maior
      slug: 'evento-teste-valor-maior-' + Date.now(),
      status: 'active',
      has_payment: true,
      payment_gateway: 'mercadopago'
    }).returning('id');
    
    const eventoIdFinal = eventoId.id || eventoId;
    console.log('✅ Evento criado com ID:', eventoIdFinal);
    
    // Criar lote com valor maior
    const [loteId] = await knex('lots').insert({
      event_id: eventoIdFinal,
      name: 'LOTE TESTE - R$ 50,00',
      price: 50.00,  // Valor maior
      quantity: 50,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      is_free: false
    }).returning('id');
    
    const loteIdFinal = loteId.id || loteId;
    console.log('✅ Lote criado com ID:', loteIdFinal);
    console.log('💰 Valor do lote: R$ 50,00');
    
    // Verificar se foi criado
    const evento = await knex('events').where('id', eventoIdFinal).first();
    const lote = await knex('lots').where('id', loteIdFinal).first();
    
    console.log('\n📋 DETALHES DO EVENTO:');
    console.log('📦 ID:', evento.id);
    console.log('📦 Título:', evento.title);
    console.log('📦 Slug:', evento.slug);
    console.log('📦 Status:', evento.status);
    console.log('📦 Preço:', evento.price);
    
    console.log('\n📋 DETALHES DO LOTE:');
    console.log('📦 ID:', lote.id);
    console.log('📦 Nome:', lote.name);
    console.log('📦 Preço:', lote.price);
    console.log('📦 Quantidade:', lote.quantity);
    console.log('📦 É gratuito:', lote.is_free);
    
    console.log('\n🎯 URL PARA TESTE:');
    console.log(`🌐 https://igrejacemchurch.org/evento/${evento.slug}`);
    console.log(`🌐 https://siteigreja-1.onrender.com/evento/${evento.slug}`);
    
    console.log('\n✅ EVENTO CRIADO COM SUCESSO!');
    console.log('💰 Valor: R$ 50,00 (maior que R$ 1,00)');
    console.log('🔗 Teste a inscrição no evento acima');
    
  } catch (error) {
    console.error('❌ Erro ao criar evento:', error);
  } finally {
    await knex.destroy();
  }
}

criarEventoValorMaior(); 