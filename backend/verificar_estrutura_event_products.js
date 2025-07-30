const { db } = require('./src/database/db');

console.log('🔍 Verificando estrutura da tabela event_products...');

async function verificarEstruturaEventProducts() {
  try {
    console.log('📋 Verificando estrutura da tabela...');
    
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('event_products');
    console.log('📊 Tabela event_products existe:', tableExists);
    
    if (!tableExists) {
      console.log('❌ Tabela event_products não existe!');
      return;
    }
    
    // Verificar estrutura da tabela
    const columns = await db('event_products').columnInfo();
    console.log('📋 Colunas da tabela event_products:', Object.keys(columns));
    
    // Verificar todos os produtos
    console.log('📋 Verificando todos os produtos...');
    const allProducts = await db('event_products').select('*');
    console.log(`📊 Total de produtos: ${allProducts.length}`);
    
    if (allProducts.length > 0) {
      console.log('🛍️ Produtos encontrados:');
      allProducts.forEach((product, index) => {
        console.log(`  ${index + 1}. ID: ${product.id} | Event ID: ${product.event_id} | Nome: ${product.name} | Ativo: ${product.is_active}`);
      });
    }
    
    // Verificar produtos do evento 14 especificamente
    console.log('\n📋 Verificando produtos do evento 14...');
    const event14Products = await db('event_products')
      .where('event_id', 14)
      .select('*');
    
    console.log(`📊 Produtos do evento 14: ${event14Products.length}`);
    
    if (event14Products.length > 0) {
      console.log('🛍️ Produtos do evento 14:');
      event14Products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price} - Ativo: ${product.is_active}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado para o evento 14');
    }
    
    // Testar a query exata da API
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
    console.error('❌ Erro ao verificar estrutura:', error);
  } finally {
    process.exit(0);
  }
}

verificarEstruturaEventProducts(); 