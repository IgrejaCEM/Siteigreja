const { db } = require('./src/database/db');

async function testFrontendData() {
  try {
    console.log('🧪 Testando dados do frontend...');
    
    // Simular dados que o frontend está enviando
    const frontendData = {
      event_id: 14,
      customer: {
        name: 'Teste Usuário',
        email: 'teste@teste.com',
        phone: '11999999999'
      },
      items: [
        {
          type: 'EVENT_TICKET',
          name: 'Ingresso - FREE TESTE',
          price: 50,
          quantity: 1,
          lot_id: 1  // Este é o problema - deveria ser 5 ou 6
        }
      ],
      products: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 25
        }
      ],
      totalAmount: 75
    };
    
    console.log('📦 Dados do frontend:', JSON.stringify(frontendData, null, 2));
    
    // Verificar se o lote 1 existe
    const lot1 = await db('lots').where('id', 1).first();
    console.log('🔍 Lote 1 existe:', !!lot1);
    if (lot1) {
      console.log('📋 Lote 1:', lot1);
    }
    
    // Verificar lotes do evento 14
    const eventLots = await db('lots').where('event_id', 14).select('*');
    console.log('📋 Lotes do evento 14:');
    eventLots.forEach((lot, index) => {
      console.log(`  ${index + 1}. ID: ${lot.id} | Nome: ${lot.name} | Preço: R$ ${lot.price}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

testFrontendData(); 