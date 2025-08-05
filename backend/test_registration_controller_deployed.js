const axios = require('axios');

async function testRegistrationControllerDeployed() {
  console.log('🧪 Testando RegistrationController no backend deployado...');
  
  const testData = {
    event_id: 999, // Store-only purchase
    customer: {
      name: "Teste Usuário",
      email: "teste@teste.com", 
      phone: "11999999999",
      cpf: null
    },
    items: [],
    products: [
      {
        product_id: 1,
        quantity: 1,
        unit_price: 25
      }
    ],
    totalAmount: 25
  };
  
  try {
    console.log('📤 Enviando dados para backend deployado...');
    console.log('📤 Dados:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Resposta do backend:', response.status);
    console.log('✅ Dados da resposta:', response.data);
    
  } catch (error) {
    console.log('❌ Erro na requisição:', error.response?.status);
    console.log('❌ Dados do erro:', error.response?.data);
    console.log('❌ Mensagem:', error.message);
  }
}

testRegistrationControllerDeployed(); 