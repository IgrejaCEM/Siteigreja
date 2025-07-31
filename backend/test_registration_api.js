const axios = require('axios');

async function testRegistrationAPI() {
  try {
    console.log('🧪 Testando API de registrations...');
    
    const testData = {
      event_id: 14, // Adicionar event_id
      customer: {
        name: 'Teste Usuário',
        email: 'teste@teste.com',
        phone: '11999999999',
        cpf: '12345678901'
      },
      items: [
        {
          id: 1,
          type: 'EVENT_PRODUCT',
          quantity: 1,
          lot_id: 1
        }
      ],
      totalAmount: 50.00
    };

    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('https://siteigreja-1.onrender.com/api/registrations', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://siteigreja.vercel.app'
      }
    });

    console.log('✅ Resposta da API:', response.status, response.data);
    
  } catch (error) {
    console.error('❌ Erro na API:', error.response?.status, error.response?.data);
    console.error('❌ Erro completo:', error.message);
  }
}

testRegistrationAPI(); 