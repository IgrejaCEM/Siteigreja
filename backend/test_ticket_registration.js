const axios = require('axios');

const API_BASE_URL = 'https://siteigreja.onrender.com/api';

async function testTicketRegistration() {
  try {
    console.log('🧪 Testando registro com ticket...');
    
    const data = {
      "event_id": 14,
      "customer": {
        "name": "Teste Usuário",
        "email": "teste@teste.com",
        "phone": "11999999999",
        "cpf": null
      },
      "items": [
        {
          "type": "event_ticket",
          "name": "Ingresso - FREE TESTE",
          "price": 50,
          "quantity": 1,
          "lot_id": 6
        }
      ],
      "products": []
    };
    
    console.log('📤 Dados:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/registrations`, data);
    
    console.log('✅ Status:', response.status);
    console.log('📊 Resposta:', response.data);
    
  } catch (error) {
    console.error('❌ Erro ao testar registro com ticket:');
    console.error('   Status:', error.response?.status);
    console.error('   Mensagem:', error.response?.data);
    console.error('   Erro completo:', error.message);
  }
}

testTicketRegistration(); 