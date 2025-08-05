// Script para verificar o status do backend em produção
const axios = require('axios');

async function checkProductionBackend() {
  try {
    console.log('🔍 VERIFICANDO STATUS DO BACKEND EM PRODUÇÃO...');
    
    // Testar health check
    console.log('🏥 Testando health check...');
    const healthResponse = await axios.get('https://siteigreja.onrender.com/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Testar health check detalhado
    console.log('\n🔍 Testando health check detalhado...');
    const detailedResponse = await axios.get('https://siteigreja.onrender.com/api/health/detailed');
    console.log('✅ Health check detalhado:', detailedResponse.data);
    
    // Testar endpoint de produtos da loja
    console.log('\n🛍️ Testando endpoint de produtos da loja...');
    const productsResponse = await axios.get('https://siteigreja.onrender.com/api/store-products');
    console.log('✅ Produtos da loja:', productsResponse.data.length, 'produtos encontrados');
    
    if (productsResponse.data.length > 0) {
      console.log('📋 Lista de produtos:');
      productsResponse.data.forEach(product => {
        console.log(`   - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado no backend de produção!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar backend de produção:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

checkProductionBackend(); 