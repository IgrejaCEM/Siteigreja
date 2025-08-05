const { db } = require('./src/database/db');

async function checkProducts() {
  try {
    console.log('🔍 Verificando produtos da loja...');
    
    const products = await db('store_products').select('*');
    console.log('📦 Produtos encontrados:', products.length);
    
    products.forEach(product => {
      console.log(`   - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}, Estoque: ${product.stock}`);
    });
    
    // Verificar especificamente o produto ID 7
    const product7 = await db('store_products').where('id', 7).first();
    console.log('\n🔍 Produto ID 7:', product7);
    
    if (product7) {
      console.log('✅ Produto ID 7 encontrado!');
    } else {
      console.log('❌ Produto ID 7 não encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkProducts(); 