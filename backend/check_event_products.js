const { db } = require('./src/database/db');

async function checkEventProducts() {
  try {
    console.log('🔍 Verificando produtos do evento...');
    
    // Verificar se a tabela event_products existe
    const hasEventProductsTable = await db.schema.hasTable('event_products');
    console.log('📋 Tabela event_products existe:', hasEventProductsTable);
    
    if (!hasEventProductsTable) {
      console.log('❌ Tabela event_products não existe!');
      return;
    }
    
    // Verificar produtos cadastrados
    const allProducts = await db('event_products').select('*');
    console.log('📊 Total de produtos cadastrados:', allProducts.length);
    
    if (allProducts.length > 0) {
      console.log('📋 Produtos encontrados:');
      allProducts.forEach(product => {
        console.log(`  - ID: ${product.id}, Nome: ${product.name}, Evento: ${product.event_id}, Ativo: ${product.is_active}, Preço: R$ ${product.price}`);
      });
    }
    
    // Verificar produtos para o evento específico (ID 14)
    const eventProducts = await db('event_products')
      .where('event_id', 14)
      .where('is_active', true);
    console.log('📊 Produtos do evento 14:', eventProducts.length);
    
    if (eventProducts.length > 0) {
      console.log('📋 Produtos do evento 14:');
      eventProducts.forEach(product => {
        console.log(`  - ${product.name}: R$ ${product.price} (Estoque: ${product.stock})`);
      });
    } else {
      console.log('❌ Nenhum produto ativo encontrado para o evento 14');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar produtos:', error.message);
  } finally {
    process.exit(0);
  }
}

checkEventProducts();