const { db } = require('./src/database/db');
const StoreProduct = require('./src/models/StoreProduct');

async function testControllerSimulation() {
  console.log('🧪 Simulando exatamente o que o RegistrationController faz...');
  
  try {
    console.log('🔍 Testando conexão com banco...');
    const testConnection = await db.raw('SELECT 1 as test');
    console.log('✅ Conexão com banco OK:', testConnection.rows[0]);
    
    console.log('🔍 Verificando se a tabela store_products existe...');
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (tableExists) {
      console.log('🔍 Contando produtos na tabela...');
      const count = await db('store_products').count('* as total');
      console.log('📊 Total de produtos:', count[0].total);
      
      console.log('🔍 Listando todos os produtos...');
      const allProducts = await db('store_products').select('*');
      console.log('📦 Produtos encontrados:', allProducts.length);
      allProducts.forEach(p => {
        console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: R$ ${p.price}, Ativo: ${p.active}`);
      });
      
      console.log('🔍 Testando busca por ID 1...');
      const product1 = await db('store_products').where('id', 1).where('active', true).first();
      console.log('🔍 Produto ID 1 encontrado:', product1);
      
      console.log('🔍 Testando StoreProduct.query()...');
      const StoreProductModel = require('./src/models/StoreProduct');
      const product1Query = await StoreProductModel.query().findById(1).where('active', true);
      console.log('🔍 Produto ID 1 via StoreProduct.query():', product1Query);
      
      console.log('🔍 Testando StoreProduct.query() sem where...');
      const product1QuerySimple = await StoreProductModel.query().findById(1);
      console.log('🔍 Produto ID 1 via StoreProduct.query() simples:', product1QuerySimple);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testControllerSimulation(); 