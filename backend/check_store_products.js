const { db } = require('./src/database/db');

async function checkStoreProducts() {
  try {
    console.log('🔍 Verificando produtos da loja no banco...');
    
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (tableExists) {
      // Buscar todos os produtos
      const products = await db('store_products').select('*');
      console.log('📦 Produtos encontrados:', products.length);
      
      products.forEach(product => {
        console.log(`   - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}, Estoque: ${product.stock}`);
      });
      
      if (products.length === 0) {
        console.log('⚠️ Nenhum produto encontrado!');
      }
    } else {
      console.log('❌ Tabela store_products não existe!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkStoreProducts(); 