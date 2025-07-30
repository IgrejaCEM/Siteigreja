const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com';

async function testBackendDirect() {
  console.log('🔍 TESTANDO BACKEND DIRETAMENTE');
  console.log('=================================');
  
  try {
    // 1. Testar rota raiz
    console.log('📋 [1/3] Testando rota raiz...');
    const rootResponse = await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Backend online:', rootResponse.data);
    
    // 2. Testar rota de eventos
    console.log('📋 [2/3] Testando rota de eventos...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/api/events`);
    console.log(`✅ Eventos encontrados: ${eventsResponse.data.length}`);
    
    if (eventsResponse.data.length > 0) {
      eventsResponse.data.forEach((event, index) => {
        console.log(`  ${index + 1}. ID: ${event.id} | Título: ${event.title} | Slug: ${event.slug}`);
      });
    }
    
    // 3. Testar evento específico
    console.log('📋 [3/3] Testando evento específico...');
    const eventResponse = await axios.get(`${API_BASE_URL}/api/events/8`);
    console.log('✅ Evento encontrado:', eventResponse.data.title);
    
    if (eventResponse.data.products && eventResponse.data.products.length > 0) {
      console.log(`✅ Produtos encontrados: ${eventResponse.data.products.length}`);
      eventResponse.data.products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado para este evento');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data?.error || error.message);
    
    if (error.response?.status === 404) {
      console.log('💡 Backend não está respondendo na URL testada');
      console.log('💡 Verifique se a URL está correta');
    }
  }
}

testBackendDirect(); 