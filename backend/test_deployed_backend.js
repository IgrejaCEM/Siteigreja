const axios = require('axios');

async function testDeployedBackend() {
  console.log('🧪 Testando backend deployado...');
  
  try {
    // Testar health check
    console.log('🏥 Testando health check...');
    const healthResponse = await axios.get('https://siteigreja.onrender.com/api/health');
    console.log('✅ Health check OK:', healthResponse.status);
    
    // Testar produtos da loja
    console.log('🏪 Testando produtos da loja...');
    const productsResponse = await axios.get('https://siteigreja.onrender.com/api/store-products');
    console.log('✅ Produtos da loja:', productsResponse.data.length, 'produtos encontrados');
    
    // Testar com dados mais simples
    console.log('🧪 Testando com dados mais simples...');
    const simpleData = {
      event_id: 999,
      customer: {
        name: "Teste",
        email: "teste@teste.com",
        phone: "11999999999"
      },
      products: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 45.00
        }
      ]
    };
    
    console.log('📦 Dados simples:', JSON.stringify(simpleData, null, 2));
    
    const registrationResponse = await axios.post('https://siteigreja.onrender.com/api/registrations', simpleData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Sucesso!');
    console.log('📊 Status:', registrationResponse.status);
    console.log('📦 Resposta:', JSON.stringify(registrationResponse.data, null, 2));
    
    if (registrationResponse.data.payment_url) {
      console.log('🔗 URL de pagamento gerada:', registrationResponse.data.payment_url);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status);
    console.error('📦 Dados do erro:', error.response?.data);
    console.error('❌ Erro completo:', error.message);
  }
}

testDeployedBackend(); 