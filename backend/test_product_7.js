const { db } = require('./src/database/db');

async function testProduct7() {
  try {
    console.log('🔍 Testando busca do produto ID 7...');
    
    // Testar busca direta
    const product = await db('store_products')
      .where('id', 7)
      .first();
    
    console.log('🔍 Produto encontrado:', product);
    
    if (product) {
      console.log('✅ Produto ID 7 existe!');
      console.log('   - Nome:', product.name);
      console.log('   - Preço:', product.price);
      console.log('   - Estoque:', product.stock);
    } else {
      console.log('❌ Produto ID 7 não encontrado!');
      
      // Listar todos os produtos
      const allProducts = await db('store_products').select('*');
      console.log('🔍 Todos os produtos:', allProducts);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

testProduct7(); 