const { db } = require('./database/db');

async function testIntegration() {
  try {
    console.log('🧪 Testando integração completa...');
    
    // 1. Verificar se há eventos
    const events = await db('events').select('*').limit(5);
    console.log('📅 Eventos encontrados:', events.length);
    
    if (events.length === 0) {
      console.log('❌ Nenhum evento encontrado!');
      return;
    }
    
    const event = events[0];
    console.log('🎯 Testando com evento:', event.title);
    
    // 2. Verificar se há lotes
    const lots = await db('lots').where('event_id', event.id).select('*');
    console.log('🎫 Lotes encontrados:', lots.length);
    
    if (lots.length === 0) {
      console.log('❌ Nenhum lote encontrado!');
      return;
    }
    
    const lot = lots[0];
    console.log('🎫 Lote selecionado:', lot.name, 'R$', lot.price);
    
    // 3. Verificar se há produtos
    const products = await db('event_products').where('event_id', event.id).select('*');
    console.log('🛍️ Produtos encontrados:', products.length);
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado!');
      return;
    }
    
    const product = products[0];
    console.log('🛍️ Produto selecionado:', product.name, 'R$', product.price);
    
    // 4. Simular cálculo do total
    const inscriptionsCount = 2;
    const productQuantity = 1;
    
    const inscriptionsTotal = lot.price * inscriptionsCount;
    const productsTotal = product.price * productQuantity;
    const total = inscriptionsTotal + productsTotal;
    
    console.log('💰 Cálculo do total:');
    console.log('  - Inscrições:', inscriptionsCount, 'x R$', lot.price, '= R$', inscriptionsTotal);
    console.log('  - Produtos:', productQuantity, 'x R$', product.price, '= R$', productsTotal);
    console.log('  - Total: R$', total);
    
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await db.destroy();
  }
}

testIntegration(); 