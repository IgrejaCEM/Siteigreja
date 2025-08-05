const { db } = require('./src/database/db');
const StoreProduct = require('./src/models/StoreProduct');

async function testStoreProducts() {
  try {
    console.log('🧪 Testando busca de produtos da loja...');
    
    // Test 1: Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (!tableExists) {
      console.log('❌ Tabela store_products não existe!');
      return;
    }
    
    // Test 2: Buscar todos os produtos usando StoreProduct.query()
    console.log('🔍 Buscando todos os produtos usando StoreProduct.query()...');
    const allProducts = await StoreProduct.query().where('active', true);
    console.log('📦 Produtos encontrados:', allProducts.length);
    console.log('📋 IDs dos produtos:', allProducts.map(p => p.id));
    
    // Test 3: Buscar produto específico (ID 7)
    console.log('🔍 Buscando produto ID 7...');
    const product7 = await StoreProduct.query()
      .findById(7)
      .where('active', true);
    
    console.log('✅ Produto 7 encontrado:', !!product7);
    if (product7) {
      console.log('📋 Dados do produto 7:', {
        id: product7.id,
        name: product7.name,
        price: product7.price,
        stock: product7.stock
      });
    }
    
    // Test 4: Simular o que o RegistrationController faz
    console.log('🔍 Simulando busca do RegistrationController...');
    const testProductId = 7;
    const storeProduct = await StoreProduct.query()
      .findById(testProductId)
      .where('active', true);
    
    console.log('✅ Produto encontrado pelo RegistrationController:', !!storeProduct);
    if (storeProduct) {
      console.log('📋 Dados do produto:', {
        id: storeProduct.id,
        name: storeProduct.name,
        price: storeProduct.price,
        stock: storeProduct.stock
      });
    } else {
      console.log('❌ Produto não encontrado - isso causaria o erro 400');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    process.exit(0);
  }
}

testStoreProducts(); 