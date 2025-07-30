const axios = require('axios');

async function testProductionSimulation() {
  try {
    console.log('🧪 Simulando exatamente o que acontece no backend em produção...');
    
    // Simular os dados que chegam do frontend
    const items = [
      {
        type: 'EVENT_TICKET',
        name: 'Ingresso Teste',
        price: 100,
        quantity: 1
      }
    ];
    
    // Simular o cálculo do totalAmount
    let totalAmount = 0;
    
    for (const item of items) {
      if (item.type === 'EVENT_TICKET') {
        totalAmount += item.price * item.quantity;
        console.log(`✅ Ingresso adicionado - R$ ${item.price}`);
      }
    }
    
    console.log('💰 Valor total calculado:', totalAmount);
    
    // Forçar totalAmount a ser pelo menos 1 se for 0
    if (totalAmount === 0) {
      console.log('⚠️ TotalAmount é 0, forçando para 1');
      totalAmount = 1;
    }
    
    if (totalAmount > 0) {
      console.log('✅ TotalAmount > 0, criando pagamento...');
      
      const paymentData = {
        amount: totalAmount,
        description: 'Inscrição TEST-001',
        customer: {
          name: 'Teste Produção',
          email: 'teste@teste.com',
          phone: '11999999999',
          registration_code: 'TEST-001',
          id: 1,
          event_id: 14
        }
      };

      console.log('📦 Dados do pagamento:', JSON.stringify(paymentData, null, 2));
      
      // Usar as credenciais de produção diretamente
      const accessToken = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';
      
      const testData = {
        items: [
          {
            id: 'TEST-001',
            title: 'Inscrição TEST-001',
            description: 'Inscrição para Teste Produção',
            quantity: 1,
            unit_price: totalAmount
          }
        ],
        payer: {
          name: 'Teste',
          surname: 'Produção',
          email: 'teste@teste.com',
          phone: {
            area_code: '11',
            number: '999999999'
          }
        },
        back_urls: {
          success: 'https://igrejacemchurch.org',
          failure: 'https://igrejacemchurch.org',
          pending: 'https://igrejacemchurch.org'
        },
        auto_return: 'approved',
        external_reference: 'TEST-001',
        notification_url: 'https://siteigreja-1.onrender.com/api/payments/webhook',
        statement_descriptor: 'INSCRICAO',
        binary_mode: true,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      console.log('📦 Dados para MercadoPago:', JSON.stringify(testData, null, 2));
      
      try {
        const response = await axios.post('https://api.mercadopago.com/checkout/preferences', testData, {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        console.log('✅ Resposta do MercadoPago:', JSON.stringify(response.data, null, 2));
        
        if (response.data.init_point) {
          console.log('🎉 SUCCESS: URL do MercadoPago gerada:', response.data.init_point);
        } else {
          console.log('❌ FAIL: URL do MercadoPago não foi gerada');
        }
        
      } catch (paymentError) {
        console.error('❌ Erro ao criar pagamento:', paymentError.message);
        if (paymentError.response) {
          console.error('📊 Status:', paymentError.response.status);
          console.error('📦 Dados:', paymentError.response.data);
        }
      }
    } else {
      console.log('❌ TotalAmount <= 0, não criando pagamento');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testProductionSimulation(); 