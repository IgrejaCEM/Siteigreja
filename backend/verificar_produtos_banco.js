const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔍 VERIFICANDO PRODUTOS NO BANCO');
console.log('==================================');

const verificarProdutosBanco = async () => {
  try {
    console.log('📋 [1/4] Verificando todos os eventos...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    console.log(`📊 ${eventsResponse.data.length} eventos encontrados:`);
    
    eventsResponse.data.forEach(event => {
      console.log(`  - ID: ${event.id}, Título: ${event.title}, Slug: ${event.slug}`);
    });
    
    console.log('\n📋 [2/4] Verificando produtos do evento 13...');
    const productsResponse = await axios.get(`${API_BASE_URL}/events/13/products`);
    console.log(`📊 ${productsResponse.data.length} produtos encontrados para evento 13:`);
    
    if (productsResponse.data.length === 0) {
      console.log('❌ Nenhum produto encontrado para evento 13!');
    } else {
      productsResponse.data.forEach((product, index) => {
        console.log(`\n  Produto ${index + 1}:`);
        console.log(`    ID: ${product.id}`);
        console.log(`    Nome: ${product.name}`);
        console.log(`    Descrição: ${product.description}`);
        console.log(`    Preço: ${product.price}`);
        console.log(`    Event ID: ${product.event_id}`);
        console.log(`    Ativo: ${product.is_active}`);
      });
    }
    
    console.log('\n📋 [3/4] Verificando produtos de todos os eventos...');
    for (const event of eventsResponse.data) {
      try {
        const eventProducts = await axios.get(`${API_BASE_URL}/events/${event.id}/products`);
        console.log(`📊 Evento ${event.id} (${event.title}): ${eventProducts.data.length} produtos`);
        
        if (eventProducts.data.length > 0) {
          eventProducts.data.forEach(product => {
            console.log(`    - ${product.name} (R$ ${product.price})`);
          });
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar produtos do evento ${event.id}:`, error.message);
      }
    }
    
    console.log('\n📋 [4/4] Verificando estrutura do evento 13...');
    const event13Response = await axios.get(`${API_BASE_URL}/events/13`);
    console.log('📊 Estrutura do evento:', Object.keys(event13Response.data));
    console.log('📊 Tem products:', 'products' in event13Response.data);
    console.log('📊 Products length:', event13Response.data.products?.length || 0);
    
  } catch (error) {
    console.log('❌ Erro ao verificar produtos:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
  }
};

verificarProdutosBanco(); 