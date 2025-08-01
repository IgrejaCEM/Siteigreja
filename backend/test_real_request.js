const axios = require('axios');

async function testRealRequest() {
  try {
    console.log('🧪 Testando requisição real...');
    
    // Simular exatamente os dados que o frontend está enviando
    const requestData = {
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
    
    console.log('📦 Dados da requisição:', JSON.stringify(requestData, null, 2));
    
    // Fazer requisição real para o backend
    const response = await axios.post('https://siteigreja-1.onrender.com/api/registrations', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta do backend:', response.data);
    
  } catch (error) {
    console.error('❌ Erro na requisição:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testRealRequest(); 