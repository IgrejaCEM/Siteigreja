const axios = require('axios');

async function testStoreProductImport() {
  console.log('🧪 Testando se o import do StoreProduct foi aplicado...');
  
  const testData = {
    event_id: 999,
    customer: {
      name: "Teste Import",
      email: "teste@teste.com",
      phone: "11999999999",
      cpf: null
    },
    items: [],
    products: [
      {
        product_id: 1,
        quantity: 1,
        unit_price: 45
      }
    ]
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
    
    // Se ainda der erro 400, significa que o StoreProduct ainda não está sendo encontrado
    if (error.response?.status === 400 && error.response?.data?.error === 'Valor total inválido') {
      console.log('⚠️ O problema persiste - StoreProduct ainda não está sendo encontrado');
      console.log('⚠️ Isso indica que o deploy ainda não foi aplicado ou há outro problema');
    }
  }
}

testStoreProductImport(); 