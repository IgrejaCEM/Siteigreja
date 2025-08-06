const axios = require('axios');

async function testEventIntegration() {
  console.log('🧪 Testando integração da loja geral com eventos...');
  
  try {
    // Teste 1: Buscar evento 14 com produtos da loja geral
    console.log('🧪 Teste 1: Buscar evento 14 com produtos da loja geral');
    try {
      const response1 = await axios.get('https://siteigreja.onrender.com/api/events/14', {
        timeout: 10000
      });
      
      console.log('✅ Evento 14 encontrado:', response1.status);
      console.log('✅ Dados do evento:', {
        id: response1.data.id,
        title: response1.data.title,
        lots_count: response1.data.lots?.length || 0,
        store_products_count: response1.data.store_products?.length || 0
      });
      
      if (response1.data.store_products) {
        console.log('✅ Produtos da loja geral encontrados:', response1.data.store_products.length);
        response1.data.store_products.forEach(product => {
          console.log(`   - ${product.name}: R$ ${product.price}`);
        });
      }
      
    } catch (error1) {
      console.log('❌ Erro ao buscar evento 14:', error1.response?.status);
      console.log('❌ Dados do erro:', error1.response?.data);
    }
    
    // Teste 2: Buscar produtos da loja geral para evento 14
    console.log('\n🧪 Teste 2: Buscar produtos da loja geral para evento 14');
    try {
      const response2 = await axios.get('https://siteigreja.onrender.com/api/events/14/store-products', {
        timeout: 10000
      });
      
      console.log('✅ Produtos da loja geral para evento 14:', response2.status);
      console.log('✅ Dados:', {
        event_id: response2.data.event_id,
        products_count: response2.data.products?.length || 0,
        message: response2.data.message
      });
      
    } catch (error2) {
      console.log('❌ Erro ao buscar produtos da loja geral:', error2.response?.status);
      console.log('❌ Dados do erro:', error2.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testEventIntegration(); 