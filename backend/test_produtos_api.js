const axios = require('axios');

const API_BASE_URL = 'https://igreja-backend.onrender.com';

async function testProdutosAPI() {
  console.log('🧪 TESTANDO PRODUTOS NA API');
  console.log('============================');
  
  try {
    // 1. Testar se o backend está online
    console.log('📋 [1/4] Testando se o backend está online...');
    const rootResponse = await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Backend online:', rootResponse.data);
    
    // 2. Fazer login como admin
    console.log('📋 [2/4] Fazendo login como admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // 3. Verificar produtos via API admin
    console.log('📋 [3/4] Verificando produtos via API admin...');
    const adminProductsResponse = await axios.get(`${API_BASE_URL}/admin/event-products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`📊 Produtos via API admin: ${adminProductsResponse.data.length}`);
    if (adminProductsResponse.data.length > 0) {
      adminProductsResponse.data.forEach((product, index) => {
        console.log(`  ${index + 1}. ID: ${product.id} | Nome: ${product.name} | Preço: R$ ${product.price} | Event ID: ${product.event_id}`);
      });
    }
    
    // 4. Verificar produtos do evento 8
    console.log('📋 [4/4] Verificando produtos do evento 8...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events/8`);
    
    if (eventResponse.data.products && eventResponse.data.products.length > 0) {
      console.log(`✅ Produtos do evento 8: ${eventResponse.data.products.length}`);
      eventResponse.data.products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado para o evento 8');
    }
    
    // 5. Testar criação de novo produto via API
    console.log('\n📋 [5/5] Testando criação de produto via API...');
    const createResponse = await axios.post(`${API_BASE_URL}/event-products`, {
      event_id: 8,
      name: 'Produto Via API',
      description: 'Produto criado via API',
      price: 25.00,
      stock: 10,
      image_url: 'https://via.placeholder.com/300x200?text=API+Teste'
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Produto criado via API:', createResponse.data);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data?.error || error.message);
    
    if (error.response?.status === 404) {
      console.log('💡 Backend ainda não está respondendo. Aguarde o deploy.');
    }
  }
}

testProdutosAPI(); 