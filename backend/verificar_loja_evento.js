const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🛍️ VERIFICANDO LOJA DO EVENTO');
console.log('==============================');

const verificarLojaEvento = async () => {
  try {
    console.log('📋 [1/3] Verificando evento 13...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events/13`);
    console.log('✅ Evento encontrado:', eventResponse.data.title);
    
    console.log('📋 [2/3] Verificando produtos da loja...');
    const products = eventResponse.data.products || [];
    console.log(`📊 ${products.length} produtos na loja:`);
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto na loja!');
      console.log('📋 Verificando diretamente via API...');
      
      const productsResponse = await axios.get(`${API_BASE_URL}/events/13/products`);
      console.log(`📊 Produtos via API: ${productsResponse.data.length}`);
      
      if (productsResponse.data.length > 0) {
        productsResponse.data.forEach((product, index) => {
          console.log(`\n  Produto ${index + 1}:`);
          console.log(`    ID: ${product.id}`);
          console.log(`    Nome: ${product.name}`);
          console.log(`    Descrição: ${product.description}`);
          console.log(`    Preço: R$ ${product.price}`);
          console.log(`    Event ID: ${product.event_id}`);
          console.log(`    Ativo: ${product.is_active}`);
        });
      } else {
        console.log('❌ Nenhum produto encontrado na loja!');
      }
      
    } else {
      products.forEach((product, index) => {
        console.log(`\n  Produto ${index + 1}:`);
        console.log(`    ID: ${product.id}`);
        console.log(`    Nome: ${product.name}`);
        console.log(`    Descrição: ${product.description}`);
        console.log(`    Preço: R$ ${product.price}`);
        console.log(`    Ativo: ${product.is_active}`);
      });
    }
    
    console.log('\n📋 [3/3] Verificando estrutura do evento...');
    console.log('📊 Keys do evento:', Object.keys(eventResponse.data));
    console.log('📊 Tem products:', 'products' in eventResponse.data);
    console.log('📊 Products length:', eventResponse.data.products?.length || 0);
    
    if (eventResponse.data.products && eventResponse.data.products.length > 0) {
      console.log('✅ Produtos estão sendo retornados pela API!');
    } else {
      console.log('❌ Produtos NÃO estão sendo retornados pela API!');
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar loja:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
  }
};

verificarLojaEvento(); 