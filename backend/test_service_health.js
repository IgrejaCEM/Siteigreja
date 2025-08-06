const axios = require('axios');

async function testServiceHealth() {
  console.log('🧪 Testando saúde do serviço no ambiente de produção...');
  
  try {
    // Teste 1: Health check básico
    console.log('🧪 Teste 1: Health check básico');
    try {
      const response1 = await axios.get('https://siteigreja.onrender.com/', {
        timeout: 10000
      });
      console.log('✅ Health check OK:', response1.status);
    } catch (error1) {
      console.log('❌ Health check falhou:', error1.message);
    }
    
    // Teste 2: API base
    console.log('\n🧪 Teste 2: API base');
    try {
      const response2 = await axios.get('https://siteigreja.onrender.com/api', {
        timeout: 10000
      });
      console.log('✅ API base OK:', response2.status);
    } catch (error2) {
      console.log('❌ API base falhou:', error2.message);
    }
    
    // Teste 3: Store products
    console.log('\n🧪 Teste 3: Store products');
    try {
      const response3 = await axios.get('https://siteigreja.onrender.com/api/store-products', {
        timeout: 10000
      });
      console.log('✅ Store products OK:', response3.status);
      console.log('✅ Dados:', response3.data);
    } catch (error3) {
      console.log('❌ Store products falhou:', error3.message);
      if (error3.response) {
        console.log('❌ Status:', error3.response.status);
        console.log('❌ Dados:', error3.response.data);
      }
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testServiceHealth(); 