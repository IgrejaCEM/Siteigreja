const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔍 VERIFICANDO PRODUTOS DIRETAMENTE NO BANCO');
console.log('==============================================');

const verificarProdutosDireto = async () => {
  try {
    console.log('📋 [1/4] Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    console.log('📋 [2/4] Verificando todos os produtos no banco...');
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
      });
    } else {
      console.log('❌ Nenhum produto encontrado no banco!');
    }
    
    console.log('\n📋 [3/4] Verificando produtos do evento 13 especificamente...');
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
    
    console.log('\n📋 [4/4] Verificando produtos ativos do evento 13...');
    const activeProducts = event13Products.filter(p => p.is_active === true);
    console.log(`📊 Produtos ativos do evento 13: ${activeProducts.length}`);
    
    if (activeProducts.length === 0) {
      console.log('❌ Nenhum produto ativo encontrado!');
      console.log('📋 Verificando produtos inativos...');
      const inactiveProducts = event13Products.filter(p => p.is_active === false);
      console.log(`📊 Produtos inativos: ${inactiveProducts.length}`);
      
      if (inactiveProducts.length > 0) {
        console.log('💡 Produtos encontrados mas estão INATIVOS!');
        inactiveProducts.forEach(product => {
          console.log(`    - ${product.name} (ID: ${product.id}) - INATIVO`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar produtos:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
  }
};

verificarProdutosDireto(); 