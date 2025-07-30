const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔍 Testando produtos do evento...');

async function testarEventoProdutos() {
  try {
    console.log('📋 Buscando eventos...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    console.log(`📊 Total de eventos: ${eventsResponse.data.length}`);
    
    if (eventsResponse.data.length === 0) {
      console.log('❌ Nenhum evento encontrado!');
      return;
    }
    
    const event = eventsResponse.data[0];
    console.log(`📋 Testando evento: ${event.title} (ID: ${event.id})`);
    
    // Testar detalhes do evento
    console.log('📋 Buscando detalhes do evento...');
    const eventDetailsResponse = await axios.get(`${API_BASE_URL}/events/${event.id}`);
    const eventDetails = eventDetailsResponse.data;
    
    console.log('✅ Detalhes do evento carregados!');
    console.log(`📊 Lotes: ${eventDetails.lots?.length || 0}`);
    console.log(`📊 Produtos: ${eventDetails.products?.length || 0}`);
    
    if (eventDetails.products && eventDetails.products.length > 0) {
      console.log('🛍️ Produtos encontrados:');
      eventDetails.products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado para este evento');
    }
    
    // Testar rota específica de produtos
    console.log('📋 Testando rota de produtos do evento...');
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}/events/${event.id}/products`);
      console.log(`📊 Produtos via rota específica: ${productsResponse.data.length}`);
      
      if (productsResponse.data.length > 0) {
        console.log('🛍️ Produtos via rota específica:');
        productsResponse.data.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
        });
      }
    } catch (error) {
      console.log(`❌ Erro na rota de produtos: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar evento:', error.response?.data || error.message);
  }
}

testarEventoProdutos(); 