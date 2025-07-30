const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔍 Testando API diretamente...');

async function testarAPIDireto() {
  try {
    console.log('📋 Testando GET /events/14...');
    
    const response = await axios.get(`${API_BASE_URL}/events/14`);
    console.log('✅ Resposta da API:');
    console.log(`   Título: ${response.data.title}`);
    console.log(`   ID: ${response.data.id}`);
    console.log(`   Lotes: ${response.data.lots?.length || 0}`);
    console.log(`   Produtos: ${response.data.products?.length || 0}`);
    
    if (response.data.products && response.data.products.length > 0) {
      console.log('🛍️ Produtos retornados pela API:');
      response.data.products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
    } else {
      console.log('❌ Nenhum produto retornado pela API');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.response?.data || error.message);
  }
}

testarAPIDireto(); 