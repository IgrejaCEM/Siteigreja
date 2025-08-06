const axios = require('axios');

async function testStoreProductsEndpoint() {
  console.log('🧪 Testando endpoint de store products no ambiente de produção...');
  
  try {
    const response = await axios.get('https://siteigreja.onrender.com/api/store-products', {
      timeout: 30000
    });
    
    console.log('✅ Status:', response.status);
    console.log('✅ Dados:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Erro:', error.response?.status);
    console.log('❌ Dados do erro:', error.response?.data);
  }
}

testStoreProductsEndpoint(); 