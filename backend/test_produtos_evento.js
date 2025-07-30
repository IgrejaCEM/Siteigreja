const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🧪 TESTANDO PRODUTOS DO EVENTO');
console.log('================================');

const testProdutosEvento = async () => {
  try {
    console.log('📋 [1/3] Verificando evento 13...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events/13`);
    console.log('✅ Evento encontrado:', eventResponse.data.title);
    
    console.log('📋 [2/3] Verificando produtos...');
    const products = eventResponse.data.products || [];
    console.log(`📊 ${products.length} produtos encontrados:`);
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado!');
      console.log('📋 Verificando se há produtos no banco...');
      
      // Verificar produtos diretamente no banco
      const productsResponse = await axios.get(`${API_BASE_URL}/events/13/products`);
      console.log('📊 Produtos diretos:', productsResponse.data);
      
    } else {
      products.forEach((product, index) => {
        console.log(`\n  Produto ${index + 1}:`);
        console.log(`    ID: ${product.id}`);
        console.log(`    Nome: ${product.name}`);
        console.log(`    Descrição: ${product.description}`);
        console.log(`    Preço: ${product.price}`);
        console.log(`    Ativo: ${product.is_active}`);
      });
    }
    
    console.log('📋 [3/3] Verificando estrutura completa do evento...');
    console.log('📊 Keys do evento:', Object.keys(eventResponse.data));
    console.log('📊 Tem products:', 'products' in eventResponse.data);
    console.log('📊 Products é array:', Array.isArray(eventResponse.data.products));
    
  } catch (error) {
    console.log('❌ Erro ao verificar produtos:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
  }
};

testProdutosEvento(); 