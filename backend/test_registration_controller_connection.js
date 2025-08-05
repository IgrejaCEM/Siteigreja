const { db } = require('./src/database/db');
const StoreProduct = require('./src/models/StoreProduct');

async function testRegistrationControllerConnection() {
  console.log('🧪 Testando conexão do banco que o RegistrationController usa...');
  
  try {
    // Teste 1: Conexão básica
    console.log('🧪 Teste 1: Conexão básica');
    const testConnection = await db.raw('SELECT 1 as test');
    console.log('✅ Conexão OK:', testConnection.rows[0]);
    
    // Teste 2: Verificar tabela store_products
    console.log('\n🧪 Teste 2: Verificar tabela store_products');
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (tableExists) {
      // Teste 3: Contar produtos
      console.log('\n🧪 Teste 3: Contar produtos');
      const count = await db('store_products').count('* as total');
      console.log('✅ Total de produtos:', count[0].total);
      
      // Teste 4: Listar todos os produtos
      console.log('\n🧪 Teste 4: Listar todos os produtos');
      const allProducts = await db('store_products').select('*');
      console.log('✅ Produtos encontrados:', allProducts.length);
      allProducts.forEach(p => {
        console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: ${p.price}, Ativo: ${p.active}`);
      });
      
      // Teste 5: Buscar produto específico (ID 3)
      console.log('\n🧪 Teste 5: Buscar produto ID 3');
      const product3 = await db('store_products')
        .where('id', 3)
        .where('active', true)
        .first();
      console.log('✅ Produto ID 3 encontrado:', !!product3);
      if (product3) {
        console.log('✅ Nome:', product3.name);
        console.log('✅ Preço:', product3.price);
      }
      
      // Teste 6: Testar StoreProduct.query()
      console.log('\n🧪 Teste 6: Testar StoreProduct.query()');
      const storeProducts = await StoreProduct.query().where('active', true);
      console.log('✅ StoreProduct.query() encontrou:', storeProducts.length, 'produtos');
      storeProducts.forEach(p => {
        console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: ${p.price}`);
      });
      
      // Teste 7: Testar StoreProduct.query().findById(3)
      console.log('\n🧪 Teste 7: Testar StoreProduct.query().findById(3)');
      const specificProduct = await StoreProduct.query().findById(3).where('active', true);
      console.log('✅ StoreProduct.query().findById(3) encontrado:', !!specificProduct);
      if (specificProduct) {
        console.log('✅ Nome:', specificProduct.name);
        console.log('✅ Preço:', specificProduct.price);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testRegistrationControllerConnection(); 