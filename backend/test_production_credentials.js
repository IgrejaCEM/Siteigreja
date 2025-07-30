const axios = require('axios');

async function testProductionCredentials() {
  try {
    console.log('🧪 Testando credenciais de produção...');
    
    // Testar se o backend está respondendo
    const healthResponse = await axios.get('https://siteigreja.onrender.com/api/events', {
      timeout: 10000
    });
    
    console.log('✅ Backend está respondendo');
    console.log('📊 Status:', healthResponse.status);
    
    // Testar criação de inscrição com dados mínimos
    const testData = {
      event_id: 14,
      customer: {
        name: 'Teste Credenciais',
        email: 'teste@teste.com',
        phone: '11999999999'
      },
      items: [
        {
          type: 'EVENT_TICKET',
          name: 'Ingresso Teste',
          price: 50,
          quantity: 1
        }
      ]
    };

    console.log('📦 Enviando dados de teste...');

    const response = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta do backend:', JSON.stringify(response.data, null, 2));
    
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

testProductionCredentials(); 