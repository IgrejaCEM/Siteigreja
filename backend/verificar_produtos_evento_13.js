const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔍 VERIFICANDO PRODUTOS DO EVENTO 13');
console.log('=====================================');

const verificarProdutosEvento13 = async () => {
  try {
    console.log('📋 [1/3] Buscando detalhes do evento 13...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events/13`);
    
    console.log('✅ Evento encontrado:', eventResponse.data.title);
    console.log(`📊 ID do evento: ${eventResponse.data.id}`);
    console.log(`📊 Slug do evento: ${eventResponse.data.slug}`);
    
    console.log('\n📋 [2/3] Verificando produtos do evento...');
    const products = eventResponse.data.products || [];
    console.log(`📊 Total de produtos: ${products.length}`);
    
    if (products.length > 0) {
      products.forEach((product, index) => {
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
      console.log('❌ Nenhum produto encontrado para este evento!');
    }
    
    console.log('\n📋 [3/3] Verificando lotes do evento...');
    const lots = eventResponse.data.lots || [];
    console.log(`📊 Total de lotes: ${lots.length}`);
    
    if (lots.length > 0) {
      lots.forEach((lot, index) => {
        console.log(`\n  Lote ${index + 1}:`);
        console.log(`    ID: ${lot.id}`);
        console.log(`    Nome: ${lot.name}`);
        console.log(`    Preço: R$ ${lot.price}`);
        console.log(`    Quantidade: ${lot.quantity}`);
        console.log(`    Ativo: ${lot.status}`);
      });
    } else {
      console.log('❌ Nenhum lote encontrado para este evento!');
    }
    
    console.log('\n🎯 CONCLUSÃO:');
    if (products.length > 0) {
      console.log('✅ Produtos encontrados! Eles DEVEM aparecer na home page.');
      console.log('💡 Se não estão aparecendo, pode ser um problema no frontend.');
    } else {
      console.log('❌ Nenhum produto encontrado! Precisamos criar produtos primeiro.');
      console.log('💡 Execute: node criar_produtos_teste.js');
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar produtos:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
  }
};

verificarProdutosEvento13(); 