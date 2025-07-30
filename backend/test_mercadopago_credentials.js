const axios = require('axios');

async function testMercadoPagoCredentials() {
  try {
    console.log('🧪 Testando credenciais do MercadoPago...');
    
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
        name: 'Teste MercadoPago',
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

    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));

    const response = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta completa do backend:', JSON.stringify(response.data, null, 2));
    
    if (response.data.payment_url) {
      console.log('🎉 SUCCESS: Payment URL gerada:', response.data.payment_url);
    } else {
      console.log('❌ FAIL: Payment URL não foi gerada');
      console.log('🔍 Verificando se há erro nas credenciais...');
      
      // Verificar se há erro específico do MercadoPago
      if (response.data.error) {
        console.log('❌ Erro do backend:', response.data.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📦 Dados:', error.response.data);
    }
  }
}

testMercadoPagoCredentials(); 