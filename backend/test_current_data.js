const { db } = require('./src/database/db');

async function testCurrentData() {
  try {
    console.log('🧪 Testando dados atuais...');
    
    // Simular dados que estão sendo enviados (apenas ticket, sem produtos da loja)
    const currentData = {
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
          lot_id: 1  // Este é o problema
        }
      ],
      products: []  // Sem produtos da loja
    };
    
    console.log('📦 Dados atuais:', JSON.stringify(currentData, null, 2));
    
    // Simular o processamento
    let totalAmount = 0;
    console.log('💰 Iniciando cálculo do valor total...');
    
    if (currentData.items && currentData.items.length > 0) {
      console.log('🛍️ Processando itens:', currentData.items);
      
      for (const item of currentData.items) {
        if (item.type === 'EVENT_TICKET') {
          if (item.lot_id) {
            console.log('🔍 Buscando lote:', item.lot_id);
            const lot = await db('lots')
              .where('id', item.lot_id)
              .first();
            
            console.log('🔍 Lote encontrado:', lot);
            
            if (lot) {
              totalAmount += lot.price * item.quantity;
              console.log(`✅ Ingresso do lote ${lot.name} adicionado - R$ ${lot.price}`);
              console.log(`💰 TotalAmount após ingresso: R$ ${totalAmount}`);
            } else {
              console.log('⚠️ Lote não encontrado, usando preço do item');
              totalAmount += item.price * item.quantity;
              console.log(`✅ Ingresso adicionado usando preço do item - R$ ${item.price}`);
              console.log(`💰 TotalAmount após ingresso: R$ ${totalAmount}`);
            }
          } else {
            totalAmount += item.price * item.quantity;
            console.log(`✅ Ingresso adicionado - R$ ${item.price}`);
            console.log(`💰 TotalAmount após ingresso: R$ ${totalAmount}`);
          }
        }
      }
    }
    
    console.log('💰 TotalAmount final:', totalAmount);
    
    if (totalAmount <= 0) {
      console.log('⚠️ TotalAmount é inválido:', totalAmount);
      console.log('❌ Isso causaria erro 400');
    } else {
      console.log('✅ TotalAmount válido:', totalAmount);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

testCurrentData(); 