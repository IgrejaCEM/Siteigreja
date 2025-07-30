const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testProdutosHome() {
  console.log('🧪 TESTANDO PRODUTOS NA HOME PAGE');
  console.log('===================================');
  
  try {
    // 1. Testar se o backend está online
    console.log('📋 [1/4] Testando se o backend está online...');
    const rootResponse = await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Backend online:', rootResponse.data);
    
    // 2. Buscar eventos
    console.log('📋 [2/4] Buscando eventos...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    console.log(`📊 Total de eventos: ${eventsResponse.data.length}`);
    
    if (eventsResponse.data.length === 0) {
      console.log('❌ Nenhum evento encontrado!');
      return;
    }
    
    // 3. Verificar produtos de cada evento
    console.log('📋 [3/4] Verificando produtos de cada evento...');
    for (const event of eventsResponse.data) {
      console.log(`\n🔍 Evento: ${event.title} (ID: ${event.id}, Slug: ${event.slug})`);
      
      try {
        const eventDetailsResponse = await axios.get(`${API_BASE_URL}/events/${event.slug || event.id}`);
        const eventDetails = eventDetailsResponse.data;
        
        if (eventDetails.products && eventDetails.products.length > 0) {
          console.log(`✅ Produtos encontrados: ${eventDetails.products.length}`);
          eventDetails.products.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
          });
        } else {
          console.log('❌ Nenhum produto encontrado para este evento');
        }
      } catch (error) {
        console.log(`❌ Erro ao buscar detalhes do evento: ${error.response?.status}`);
      }
    }
    
    // 4. Testar criação de produto via API
    console.log('\n📋 [4/4] Testando criação de produto...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        emailOrUsername: 'admin',
        password: 'admin123'
      });
      
      const token = loginResponse.data.token;
      console.log('✅ Login realizado com sucesso');
      
      const createResponse = await axios.post(`${API_BASE_URL}/event-products`, {
        event_id: 8,
        name: 'Produto Teste Home',
        description: 'Produto para testar na home page',
        price: 20.00,
        stock: 10,
        image_url: 'https://via.placeholder.com/300x200?text=Home+Teste'
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Produto criado via API:', createResponse.data);
      
      // Verificar se o produto aparece no evento
      const eventResponse = await axios.get(`${API_BASE_URL}/events/8`);
      if (eventResponse.data.products && eventResponse.data.products.length > 0) {
        console.log(`✅ Produto aparece no evento: ${eventResponse.data.products.length} produtos`);
      } else {
        console.log('❌ Produto não aparece no evento');
      }
      
    } catch (error) {
      console.log(`❌ Erro ao criar produto: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data?.error || error.message);
    
    if (error.response?.status === 404) {
      console.log('💡 Backend ainda não está respondendo. Aguarde o deploy.');
    }
  }
}

testProdutosHome(); 