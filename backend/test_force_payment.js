const axios = require('axios');

async function testForcePayment() {
  try {
    console.log('🧪 Forçando teste de pagamento em produção...');
    
    const testData = {
      event_id: 14,
      customer: {
        name: 'Teste Force',
        email: 'teste@teste.com',
        phone: '11999999999'
      },
      items: [
        {
          type: 'EVENT_TICKET',
          name: 'Ingresso Teste',
          price: 100,
          quantity: 1
        }
      ]
    };

    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('https://siteigreja-1.onrender.com/api/registrations', testData, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta do backend:', JSON.stringify(response.data, null, 2));
    
    if (response.data.payment_url) {
      console.log('🎉 SUCCESS: Payment URL gerada:', response.data.payment_url);
    } else {
      console.log('❌ FAIL: Payment URL não foi gerada');
      console.log('📊 Dados da resposta:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar pagamento:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📦 Dados:', error.response.data);
    }
  }
}

testForcePayment(); 