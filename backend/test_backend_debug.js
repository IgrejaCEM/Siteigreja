const axios = require('axios');

async function testBackend() {
  try {
    console.log('🧪 Testando backend...');
    
    const testData = {
      event_id: 14,
      customer: {
        name: "Teste Usuário",
        email: "teste@teste.com",
        phone: "11999999999",
        cpf: "12345678901",
        address: {
          street: "Rua Teste",
          number: "123",
          complement: "Apto 1",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01001-000"
        }
      },
      items: [
        {
          type: "event_ticket",
          name: "Ingresso - FREE TESTE",
          price: 50,
          quantity: 1,
          lot_id: 6
        }
      ],
      products: []
    };

    console.log('📦 Dados do teste:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta do backend:', JSON.stringify(response.data, null, 2));
    
    if (response.data.payment && response.data.payment.payment_url) {
      console.log('🎉 SUCCESS: Payment URL gerada:', response.data.payment.payment_url);
    } else {
      console.log('❌ ERROR: Payment URL não foi gerada');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testBackend(); 