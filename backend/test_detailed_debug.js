const axios = require('axios');

async function testDetailedDebug() {
  try {
    console.log('🧪 Teste detalhado para debug...');
    
    const testData = {
      event_id: 14,
      customer: {
        name: 'Teste Debug',
        email: 'teste@teste.com',
        phone: '11999999999'
      },
      items: [
        {
          type: 'EVENT_TICKET',
          name: 'Ingresso Teste',
          price: 50,
          quantity: 1,
          lot_id: 1
        }
      ]
    };

    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));

    const response = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta completa do backend:', JSON.stringify(response.data, null, 2));
    
    if (response.data.payment_url) {
      console.log('✅ Payment URL está sendo retornada!');
      console.log('🔗 URL:', response.data.payment_url);
    } else {
      console.log('❌ Payment URL não está sendo retornada');
      console.log('📊 Dados da resposta:');
      console.log('   - order_id:', response.data.order_id);
      console.log('   - registration_code:', response.data.registration_code);
      console.log('   - status:', response.data.status);
      console.log('   - payment_url:', response.data.payment_url);
      console.log('   - payment_id:', response.data.payment_id);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📊 Headers:', error.response.headers);
    }
  }
}

testDetailedDebug(); 