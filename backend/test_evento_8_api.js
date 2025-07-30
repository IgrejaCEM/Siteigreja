const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com';

async function testEvento8API() {
  console.log('🔍 TESTANDO EVENTO 8 NA API');
  console.log('============================');
  
  try {
    // 1. Listar todos os eventos
    console.log('📋 [1/3] Listando todos os eventos...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/api/events`);
    console.log(`📊 Total de eventos na API: ${eventsResponse.data.length}`);
    
    eventsResponse.data.forEach((event, index) => {
      console.log(`  ${index + 1}. ID: ${event.id} | Título: ${event.title} | Slug: ${event.slug}`);
    });
    
    // 2. Testar evento 8 especificamente
    console.log('📋 [2/3] Testando evento 8...');
    try {
      const event8Response = await axios.get(`${API_BASE_URL}/api/events/8`);
      console.log('✅ Evento 8 encontrado na API:', event8Response.data.title);
      
      if (event8Response.data.products && event8Response.data.products.length > 0) {
        console.log(`✅ Produtos encontrados: ${event8Response.data.products.length}`);
        event8Response.data.products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
        });
      } else {
        console.log('❌ Nenhum produto encontrado para o evento 8');
      }
    } catch (error) {
      console.log(`❌ Evento 8 não encontrado na API: ${error.response?.status}`);
    }
    
    // 3. Testar evento 13 (que aparece na API)
    console.log('📋 [3/3] Testando evento 13...');
    try {
      const event13Response = await axios.get(`${API_BASE_URL}/api/events/13`);
      console.log('✅ Evento 13 encontrado na API:', event13Response.data.title);
      
      if (event13Response.data.products && event13Response.data.products.length > 0) {
        console.log(`✅ Produtos encontrados: ${event13Response.data.products.length}`);
        event13Response.data.products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
        });
      } else {
        console.log('❌ Nenhum produto encontrado para o evento 13');
      }
    } catch (error) {
      console.log(`❌ Evento 13 não encontrado na API: ${error.response?.status}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data?.error || error.message);
  }
}

testEvento8API(); 