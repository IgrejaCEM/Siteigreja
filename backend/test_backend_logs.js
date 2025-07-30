const axios = require('axios');

async function testBackendLogs() {
  try {
    console.log('🧪 Testando backend para ver logs do PaymentGateway...');
    
    const testData = {
      event_id: 14,
      customer: {
        name: 'Teste Logs',
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

    const response = await axios.post('https://igreja-backend.onrender.com/api/registrations', testData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta do backend:', response.data);
    console.log('🔗 Payment URL:', response.data.payment_url);
    console.log('🆔 Order ID:', response.data.order_id);
    
    if (response.data.payment_url) {
      console.log('✅ Payment URL está sendo retornada!');
    } else {
      console.log('❌ Payment URL não está sendo retornada');
      console.log('⚠️ Verifique os logs do backend no Render.com para ver os logs detalhados');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    console.log('⚠️ Verifique os logs do backend no Render.com para ver os logs detalhados');
  }
}

testBackendLogs(); 