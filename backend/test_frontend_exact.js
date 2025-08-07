const axios = require('axios');

const API_BASE_URL = 'https://siteigreja.onrender.com/api';

async function testFrontendExact() {
  try {
    console.log('🧪 Testando exatamente os dados do frontend...');
    
    const data = {
      "event_id": 14,
      "customer": {
        "name": "admin admin",
        "email": "admin@example.com",
        "phone": "13996150372",
        "cpf": "Lucas Carvalho",
        "address": {
          "street": "aaaaaaa",
          "number": "370",
          "complement": "aaaaaaa",
          "neighborhood": "Parafuso",
          "city": "Cajati",
          "state": "São Paulo",
          "zipCode": "11950-000"
        }
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
    
    console.log('📤 Dados exatos do frontend:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/registrations`, data);
    
    console.log('✅ Status:', response.status);
    console.log('📊 Resposta:', response.data);
    console.log('🔗 Payment URL:', response.data.payment?.payment_url);
    
  } catch (error) {
    console.error('❌ Erro ao testar dados exatos do frontend:');
    console.error('   Status:', error.response?.status);
    console.error('   Mensagem:', error.response?.data);
    console.error('   Erro completo:', error.message);
  }
}

testFrontendExact(); 