const axios = require('axios');

const API_BASE_URL = 'https://igreja-backend.onrender.com';

async function testProdutosAposCorrecao() {
  console.log('🧪 TESTANDO PRODUTOS APÓS CORREÇÃO');
  console.log('====================================');
  
  try {
    // 1. Fazer login como admin
    console.log('📋 [1/4] Fazendo login como admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // 2. Verificar produtos existentes
    console.log('📋 [2/4] Verificando produtos existentes...');
    const existingResponse = await axios.get(`${API_BASE_URL}/admin/event-products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`📊 Produtos existentes: ${existingResponse.data.length}`);
    
    // 3. Criar novo produto
    console.log('📋 [3/4] Criando novo produto...');
    const createResponse = await axios.post(`${API_BASE_URL}/event-products`, {
      event_id: 13,
      name: 'Produto Teste Correção',
      description: 'Produto criado após correção do Objection.js',
      price: 25.00,
      stock: 10,
      image_url: 'https://via.placeholder.com/300x200?text=Teste+Correcao'
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Produto criado com sucesso!');
    console.log(`📊 ID: ${createResponse.data.id}`);
    console.log(`📊 Nome: ${createResponse.data.name}`);
    console.log(`📊 Preço: ${createResponse.data.price}`);
    
    // 4. Verificar se foi persistido
    console.log('📋 [4/4] Verificando persistência...');
    const checkResponse = await axios.get(`${API_BASE_URL}/admin/event-products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`📊 Produtos após criação: ${checkResponse.data.length}`);
    
    if (checkResponse.data.length > 0) {
      console.log('✅ Produtos encontrados:');
      checkResponse.data.forEach((product, index) => {
        console.log(`  ${index + 1}. ID: ${product.id} | Nome: ${product.name} | Preço: R$ ${product.price} | Event ID: ${product.event_id}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado!');
    }
    
    // 5. Testar busca por evento específico
    console.log('\n📋 [5/5] Testando busca por evento 13...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events/13`);
    
    if (eventResponse.data.products && eventResponse.data.products.length > 0) {
      console.log(`✅ Produtos do evento 13: ${eventResponse.data.products.length}`);
      eventResponse.data.products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado para o evento 13');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data?.error || error.message);
  }
}

testProdutosAposCorrecao(); 