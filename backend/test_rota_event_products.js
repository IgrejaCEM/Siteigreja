const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🧪 TESTANDO ROTA /admin/event-products');
console.log('======================================');

const testRotaEventProducts = async () => {
  try {
    console.log('📋 [1/2] Fazendo login como admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    console.log('📋 [2/2] Testando rota /admin/event-products...');
    const response = await axios.get(`${API_BASE_URL}/admin/event-products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📊 Status da resposta: ${response.status}`);
    console.log(`📊 Total de produtos retornados: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('\n📦 Produtos encontrados:');
      response.data.forEach((product, index) => {
        console.log(`\n  Produto ${index + 1}:`);
        console.log(`    ID: ${product.id}`);
        console.log(`    Nome: ${product.name}`);
        console.log(`    Event ID: ${product.event_id}`);
        console.log(`    Ativo: ${product.is_active}`);
      });
    } else {
      console.log('❌ Nenhum produto retornado pela rota!');
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar rota:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
    console.log('📋 Dados da resposta:', error.response?.data);
  }
};

testRotaEventProducts(); 