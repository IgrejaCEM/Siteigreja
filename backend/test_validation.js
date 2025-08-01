const { db } = require('./src/database/db');

async function testValidation() {
  try {
    console.log('🧪 Testando validação de dados...');
    
    // Simular dados que estão sendo enviados
    const testData = {
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
          lot_id: 1
        }
      ],
      products: []
    };
    
    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));
    
    // Testar validação de dados obrigatórios
    const customerData = testData.customer || {};
    const finalName = customerData.name || '';
    const finalEmail = customerData.email || '';
    const finalPhone = customerData.phone || '';
    
    console.log('👤 Dados do cliente:', {
      name: finalName,
      email: finalEmail,
      phone: finalPhone
    });
    
    // Validar dados obrigatórios
    if (!finalName || !finalEmail || !finalPhone) {
      console.log('❌ Dados obrigatórios faltando:');
      console.log('  - Nome:', !!finalName);
      console.log('  - Email:', !!finalEmail);
      console.log('  - Telefone:', !!finalPhone);
      return;
    }
    
    console.log('✅ Dados obrigatórios OK');
    
    // Testar cálculo do total
    let totalAmount = 0;
    
    if (testData.items && testData.items.length > 0) {
      for (const item of testData.items) {
        if (item.type === 'EVENT_TICKET') {
          if (item.lot_id) {
            const lot = await db('lots')
              .where('id', item.lot_id)
              .first();
            
            if (lot) {
              totalAmount += lot.price * item.quantity;
              console.log(`✅ Lote encontrado: ${lot.name} - R$ ${lot.price}`);
            } else {
              totalAmount += item.price * item.quantity;
              console.log(`⚠️ Lote não encontrado, usando preço do item: R$ ${item.price}`);
            }
          } else {
            totalAmount += item.price * item.quantity;
            console.log(`✅ Usando preço do item: R$ ${item.price}`);
          }
        }
      }
    }
    
    console.log('💰 TotalAmount final:', totalAmount);
    
    if (totalAmount <= 0) {
      console.log('❌ TotalAmount inválido:', totalAmount);
    } else {
      console.log('✅ TotalAmount válido:', totalAmount);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

testValidation(); 