const axios = require('axios');

const API_BASE_URL = 'https://igreja-backend.onrender.com';

async function verificarTabelaEventProducts() {
  console.log('🔍 VERIFICANDO TABELA EVENT_PRODUCTS');
  console.log('=====================================');
  
  try {
    // 1. Fazer login como admin
    console.log('📋 [1/3] Fazendo login como admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // 2. Verificar se a tabela existe via API
    console.log('📋 [2/3] Verificando tabela event_products via API...');
    try {
      const tableResponse = await axios.get(`${API_BASE_URL}/admin/event-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Status da resposta:', tableResponse.status);
      console.log('📊 Total de produtos:', tableResponse.data.length);
      
      if (tableResponse.data.length > 0) {
        console.log('📋 Produtos encontrados:');
        tableResponse.data.forEach((product, index) => {
          console.log(`  ${index + 1}. ID: ${product.id} | Nome: ${product.name} | Preço: R$ ${product.price} | Event ID: ${product.event_id}`);
        });
      } else {
        console.log('❌ Nenhum produto encontrado na tabela');
      }
    } catch (error) {
      console.log('❌ Erro ao acessar tabela:', error.response?.status, error.response?.data?.error || error.message);
    }
    
    // 3. Tentar criar um produto de teste
    console.log('📋 [3/3] Tentando criar um produto de teste...');
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/event-products`, {
        event_id: 13,
        name: 'Produto Teste Debug',
        description: 'Produto criado para debug',
        price: 10.00,
        stock: 5,
        image_url: 'https://via.placeholder.com/300x200?text=Produto+Teste'
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Produto criado com sucesso!');
      console.log('📊 ID do produto:', createResponse.data.id);
      console.log('📊 Nome:', createResponse.data.name);
      console.log('📊 Preço:', createResponse.data.price);
      
      // Verificar se o produto foi persistido
      console.log('📋 Verificando se o produto foi persistido...');
      const checkResponse = await axios.get(`${API_BASE_URL}/admin/event-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Produtos após criação:', checkResponse.data.length);
      if (checkResponse.data.length > 0) {
        console.log('✅ Produto foi persistido corretamente!');
      } else {
        console.log('❌ Produto não foi persistido!');
      }
      
    } catch (error) {
      console.log('❌ Erro ao criar produto:', error.response?.status, error.response?.data?.error || error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

verificarTabelaEventProducts(); 