const axios = require('axios');

async function testAxiosRequest() {
  try {
    console.log('🧪 Testando requisição POST via axios...');
    
    const testData = {
      event_id: 14,
      customer: {
        name: 'Teste Axios',
        email: 'teste@teste.com',
        phone: '11999999999'
      },
      items: [
        {
          type: 'event_ticket',
          name: 'Ingresso Teste',
          price: 29.90,
          quantity: 1,
          lot_id: 9
        }
      ]
    };
    
    console.log('📦 Dados enviados:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('https://siteigreja-1.onrender.com/api/registrations', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://igrejacemchurch.org'
      },
      timeout: 30000
    });
    
    console.log('✅ Resposta do backend:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro na requisição:');
    console.error('Message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', error.response.headers);
    }
  }
}

testAxiosRequest(); 