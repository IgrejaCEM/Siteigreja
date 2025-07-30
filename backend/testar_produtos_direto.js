const { db } = require('./src/database/db');

console.log('🔍 Testando produtos diretamente no banco...');

async function testarProdutosDireto() {
  try {
    console.log('📋 Verificando produtos do evento 14...');
    
    // Verificar se o evento existe
    const event = await db('events').where('id', 14).first();
    if (!event) {
      console.log('❌ Evento 14 não encontrado');
      return;
    }
    console.log(`✅ Evento encontrado: ${event.title}`);
    
    // Verificar produtos
    const products = await db('event_products')
      .where('event_id', 14)
      .where('is_active', true);
    
    console.log(`📊 Produtos encontrados: ${products.length}`);
    
    if (products.length > 0) {
      console.log('🛍️ Produtos:');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado');
    }
    
    // Testar a query que a API usa
    console.log('\n📋 Testando query da API...');
    const apiQuery = await db('event_products')
      .where('event_id', 14)
      .where('is_active', true)
      .orderBy('created_at', 'desc');
    
    console.log(`📊 Produtos via query da API: ${apiQuery.length}`);
    
    if (apiQuery.length > 0) {
      console.log('🛍️ Produtos via query da API:');
      apiQuery.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar produtos:', error);
  } finally {
    process.exit(0);
  }
}

testarProdutosDireto(); 