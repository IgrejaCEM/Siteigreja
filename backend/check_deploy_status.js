const axios = require('axios');

async function checkDeployStatus() {
  console.log('🔍 Verificando status do deploy...');
  
  try {
    // Testar endpoint de health check
    console.log('🏥 Testando health check...');
    const healthResponse = await axios.get('https://siteigreja.onrender.com/api/health');
    console.log('✅ Health check OK:', healthResponse.status);
    
    // Testar endpoint de produtos da loja
    console.log('🏪 Testando produtos da loja...');
    const productsResponse = await axios.get('https://siteigreja.onrender.com/api/store-products');
    console.log('✅ Produtos da loja:', productsResponse.data.length, 'produtos encontrados');
    console.log('📦 Produtos:', productsResponse.data.map(p => `${p.id}: ${p.name} - R$ ${p.price}`));
    
    // Testar se o RegistrationController está funcionando
    console.log('🧪 Testando RegistrationController com produto simples...');
    const testData = {
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
          unit_price: 25.00
        }
      ]
    };
    
    const registrationResponse = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ RegistrationController funcionando!');
    console.log('📊 Status:', registrationResponse.status);
    console.log('📦 Resposta:', JSON.stringify(registrationResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status);
    console.error('📦 Dados do erro:', error.response?.data);
    console.error('❌ Erro completo:', error.message);
  }
}

checkDeployStatus(); 