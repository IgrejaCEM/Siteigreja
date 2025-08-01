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
          name: 'Ingresso - FREE TESTE',
          price: 50,
          quantity: 1,
          lot_id: 1
        }
      ],
      products: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 25
        }
      ],
      totalAmount: 75
    };

    console.log('📦 Dados do teste:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('https://siteigreja-1.onrender.com/api/registrations', testData);
    console.log('✅ Sucesso:', response.data);
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testAPI(); 