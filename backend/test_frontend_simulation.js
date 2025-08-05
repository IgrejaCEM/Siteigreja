const axios = require('axios');

async function testFrontendSimulation() {
  console.log('🧪 Simulando exatamente o que o frontend envia para compra apenas de produtos da loja...');
  
  // Dados exatos que o frontend enviaria
  const frontendData = {
    event_id: 999,
    customer: {
      name: "Teste Usuário",
      email: "teste@teste.com",
      phone: "11999999999",
      cpf: null
    },
    products: [
      {
        product_id: 1, // Bíblia Sagrada
        quantity: 1,
        unit_price: 45.00
      }
    ]
  };

  console.log('📦 Dados do frontend:', JSON.stringify(frontendData, null, 2));
  console.log('💰 Total esperado: R$ 45,00');

  try {
    console.log('🌐 Testando backend local...');
    const localResponse = await axios.post('http://localhost:3000/api/registrations', frontendData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Backend local funcionando!');
    console.log('📊 Status:', localResponse.status);
    console.log('📦 Resposta:', JSON.stringify(localResponse.data, null, 2));
    
  } catch (localError) {
    console.log('❌ Backend local não está rodando ou com erro:', localError.message);
    
    console.log('\n🌐 Testando backend deployado...');
    try {
      const deployedResponse = await axios.post('https://siteigreja.onrender.com/api/registrations', frontendData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('✅ Backend deployado funcionando!');
      console.log('📊 Status:', deployedResponse.status);
      console.log('📦 Resposta:', JSON.stringify(deployedResponse.data, null, 2));
      
      if (deployedResponse.data.payment_url) {
        console.log('🔗 URL de pagamento gerada:', deployedResponse.data.payment_url);
      }
      
    } catch (deployedError) {
      console.error('❌ Erro no backend deployado:', deployedError.response?.status);
      console.error('📦 Dados do erro:', deployedError.response?.data);
      console.error('❌ Erro completo:', deployedError.message);
    }
  }
}

testFrontendSimulation(); 