const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com';

async function testCriarProdutoAPI() {
  console.log('🧪 TESTANDO CRIAÇÃO DE PRODUTOS VIA API');
  console.log('=========================================');
  
  try {
    // 1. Fazer login como admin
    console.log('📋 [1/4] Fazendo login como admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // 2. Verificar produtos existentes
    console.log('📋 [2/4] Verificando produtos existentes...');
    const productsResponse = await axios.get(`${API_BASE_URL}/api/admin/event-products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`📊 Produtos existentes: ${productsResponse.data.length}`);
    
    // 3. Criar produto para evento 13
    console.log('📋 [3/4] Criando produto para evento 13...');
    const createResponse = await axios.post(`${API_BASE_URL}/api/event-products`, {
      event_id: 13,
      name: 'Produto Via API - Evento 13',
      description: 'Produto criado via API para evento 13',
      price: 25.00,
      stock: 10,
      image_url: 'https://via.placeholder.com/300x200?text=API+Evento+13'
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Produto criado via API:', createResponse.data);
    
    // 4. Verificar se o produto aparece no evento
    console.log('📋 [4/4] Verificando se o produto aparece no evento...');
    const eventResponse = await axios.get(`${API_BASE_URL}/api/events/13`);
    
    if (eventResponse.data.products && eventResponse.data.products.length > 0) {
      console.log(`✅ Produtos encontrados no evento: ${eventResponse.data.products.length}`);
      eventResponse.data.products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado no evento');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data?.error || error.message);
  }
}

testCriarProdutoAPI(); 