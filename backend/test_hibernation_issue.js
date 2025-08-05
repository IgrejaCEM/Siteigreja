const axios = require('axios');

async function testHibernationIssue() {
  console.log('🧪 Testando problema de hibernação no Render.com...');
  
  try {
    // Teste 1: Health check para "acordar" o serviço
    console.log('🧪 Teste 1: Health check para acordar o serviço');
    const healthResponse = await axios.get('https://siteigreja.onrender.com/api/health');
    console.log('✅ Health check OK:', healthResponse.status);
    
    // Aguardar um pouco para o serviço "acordar" completamente
    console.log('⏳ Aguardando 3 segundos para o serviço acordar...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Teste 2: Store products endpoint
    console.log('\n🧪 Teste 2: Store products endpoint');
    const storeProductsResponse = await axios.get('https://siteigreja.onrender.com/api/store-products');
    console.log('✅ Store products OK:', storeProductsResponse.status);
    console.log('✅ Produtos encontrados:', storeProductsResponse.data.length);
    
    // Aguardar mais um pouco
    console.log('⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 3: Registration endpoint com dados simples
    console.log('\n🧪 Teste 3: Registration endpoint com dados simples');
    const testData = {
      event_id: 999,
      customer: {
        name: "Teste",
        email: "teste@teste.com",
        phone: "11999999999"
      },
      items: [],
      products: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 25
        }
      ]
    };
    
    console.log('📤 Enviando dados:', JSON.stringify(testData, null, 2));
    
    const registrationResponse = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // Aumentar timeout para 60 segundos
    });
    
    console.log('✅ Registration OK:', registrationResponse.status);
    console.log('✅ Dados da resposta:', registrationResponse.data);
    
  } catch (error) {
    console.log('❌ Erro:', error.response?.status);
    console.log('❌ Dados do erro:', error.response?.data);
    console.log('❌ Mensagem:', error.message);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      console.log('🔍 Possível problema de hibernação detectado!');
      console.log('💡 Solução: Configure um uptime monitor (UptimeRobot) para manter o serviço ativo');
    }
  }
}

testHibernationIssue(); 