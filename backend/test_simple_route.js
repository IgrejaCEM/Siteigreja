const axios = require('axios');

async function testSimpleRoute() {
  try {
    console.log('🧪 Testando rota simples...');
    
    // Testar rota que sabemos que funciona
    const response = await axios.get('https://siteigreja.onrender.com/api/events', {
      timeout: 10000
    });
    
    console.log('✅ Rota /events funciona');
    console.log('📊 Status:', response.status);
    
    // Testar rota de teste
    try {
      const testResponse = await axios.get('https://siteigreja.onrender.com/api/test/env-check', {
        timeout: 10000
      });
      
      console.log('✅ Rota /test/env-check funciona');
      console.log('📊 Status:', testResponse.status);
      console.log('📦 Dados:', testResponse.data);
      
    } catch (testError) {
      console.log('❌ Rota /test/env-check não funciona');
      console.log('📊 Status:', testError.response?.status);
      console.log('📦 Dados:', testError.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testSimpleRoute(); 