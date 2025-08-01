const { db } = require('./src/database/db');

async function checkStoreProducts() {
  try {
    console.log('🔍 Verificando dados da tabela store_products...');
    
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (tableExists) {
      // Contar registros
      const count = await db('store_products').count('* as total');
      console.log('📊 Total de produtos:', count[0].total);
      
      // Listar produtos
      const products = await db('store_products').select('*');
      console.log('📋 Produtos encontrados:');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ID: ${product.id} | Nome: ${product.name} | Preço: R$ ${product.price} | Estoque: ${product.stock}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkStoreProducts(); 