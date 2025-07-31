const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testando API de registrations...');
    
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
          lot_id: 9,
          quantity: 1,
          price: 29.90
        }
      ],
      products: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 45.00
        }
      ]
    };
    
    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('https://siteigreja-1.onrender.com/api/registrations', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Resposta da API:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro na API:', error.response?.data || error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Headers:', error.response.headers);
    }
  }
}

testAPI(); 