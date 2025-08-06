const axios = require('axios');

async function testRegistrationControllerDeployed() {
  console.log('🧪 Testando RegistrationController no backend deployado...');
  
  // Teste com dados que sabemos que funcionam localmente
  const testData = {
    event_id: 999,
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
        unit_price: 45 // Usando o preço real do produto 1 (Bíblia Sagrada)
      }
    ],
    totalAmount: 45
  };
  
  console.log('📤 Enviando dados para backend deployado...');
  console.log('📤 Dados:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Sucesso na requisição:', response.status);
    console.log('✅ Dados da resposta:', response.data);
    
  } catch (error) {
    console.log('❌ Erro na requisição:', error.response?.status);
    console.log('❌ Dados do erro:', error.response?.data);
    console.log('❌ Mensagem:', error.message);
  }
}

testRegistrationControllerDeployed(); 