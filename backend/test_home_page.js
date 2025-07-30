const axios = require('axios');

const FRONTEND_URL = 'https://igrejacemchurch.org';

async function testHomePage() {
  console.log('🏠 TESTANDO HOME PAGE');
  console.log('=====================');
  
  try {
    // 1. Testar se a home page está online
    console.log('📋 [1/3] Testando se a home page está online...');
    const homeResponse = await axios.get(FRONTEND_URL);
    console.log('✅ Home page está online');
    
    // 2. Verificar se há eventos na home page
    console.log('📋 [2/3] Verificando eventos na home page...');
    console.log('💡 Acesse a home page e verifique se:');
    console.log('   - O evento CONNECT CONF 2025 aparece');
    console.log('   - A seção "🛍️ Produtos do Evento" aparece');
    console.log('   - Os produtos listados são:');
    console.log('     * Camiseta do Evento - R$ 35.00');
    console.log('     * Kit Completo - R$ 55.00');
    console.log('     * Caneca Personalizada - R$ 20.00');
    
    // 3. Testar API da home page
    console.log('📋 [3/3] Testando API da home page...');
    try {
      const apiResponse = await axios.get(`${FRONTEND_URL}/api/events/13`);
      console.log('✅ API da home page está funcionando');
      
      if (apiResponse.data.products && apiResponse.data.products.length > 0) {
        console.log(`✅ Produtos encontrados: ${apiResponse.data.products.length}`);
        apiResponse.data.products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
        });
      } else {
        console.log('❌ Nenhum produto encontrado na API da home page');
      }
    } catch (error) {
      console.log(`❌ Erro na API da home page: ${error.response?.status}`);
    }
    
    console.log('\n🎯 INSTRUÇÕES:');
    console.log('1. Acesse: https://igrejacemchurch.org');
    console.log('2. Role a página até encontrar o evento');
    console.log('3. Verifique se a seção "🛍️ Produtos do Evento" aparece');
    console.log('4. Verifique se os produtos estão listados');
    console.log('5. Teste adicionar produtos ao carrinho');
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data?.error || error.message);
  }
}

testHomePage(); 