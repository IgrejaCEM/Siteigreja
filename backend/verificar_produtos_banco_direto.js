const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔍 VERIFICANDO PRODUTOS DIRETAMENTE NO BANCO');
console.log('==============================================');

const verificarProdutosBancoDireto = async () => {
  try {
    console.log('📋 [1/3] Fazendo login como admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    console.log('📋 [2/3] Verificando todos os produtos no banco...');
    const allProductsResponse = await axios.get(`${API_BASE_URL}/admin/event-products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📊 Total de produtos no banco: ${allProductsResponse.data.length}`);
    
    if (allProductsResponse.data.length > 0) {
      allProductsResponse.data.forEach((product, index) => {
        console.log(`\n  Produto ${index + 1}:`);
        console.log(`    ID: ${product.id}`);
        console.log(`    Nome: ${product.name}`);
        console.log(`    Descrição: ${product.description}`);
        console.log(`    Preço: R$ ${product.price}`);
        console.log(`    Event ID: ${product.event_id}`);
        console.log(`    Ativo: ${product.is_active}`);
        console.log(`    Criado em: ${product.created_at}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado no banco!');
    }
    
    console.log('\n📋 [3/3] Verificando produtos do evento 13 especificamente...');
    const event13Products = allProductsResponse.data.filter(p => p.event_id === 13);
    console.log(`📊 Produtos do evento 13: ${event13Products.length}`);
    
    event13Products.forEach((product, index) => {
      console.log(`\n  Produto Evento 13 - ${index + 1}:`);
      console.log(`    ID: ${product.id}`);
      console.log(`    Nome: ${product.name}`);
      console.log(`    Descrição: ${product.description}`);
      console.log(`    Preço: R$ ${product.price}`);
      console.log(`    Ativo: ${product.is_active}`);
    });
    
    console.log('\n🎯 CONCLUSÃO:');
    if (event13Products.length > 0) {
      console.log('✅ Produtos encontrados no banco!');
      console.log('💡 Se não aparecem na API do evento, há um problema na consulta SQL.');
    } else {
      console.log('❌ Nenhum produto encontrado para o evento 13!');
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar produtos:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
  }
};

verificarProdutosBancoDireto(); 