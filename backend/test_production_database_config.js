const { db } = require('./src/database/db');
const StoreProduct = require('./src/models/StoreProduct');

async function testProductionDatabaseConfig() {
  console.log('🧪 Testando configuração do banco de produção...');
  
  try {
    // Teste 1: Verificar configuração
    console.log('🧪 Teste 1: Verificar configuração');
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 Client do banco:', db.client.config.client);
    console.log('🔍 Host:', db.client.config.connection.host);
    console.log('🔍 Database:', db.client.config.connection.database);
    console.log('🔍 User:', db.client.config.connection.user);
    
    // Teste 2: Conexão básica
    console.log('\n🧪 Teste 2: Conexão básica');
    const testConnection = await db.raw('SELECT 1 as test');
    console.log('✅ Conexão OK:', testConnection.rows[0]);
    
    // Teste 3: Verificar tabela store_products
    console.log('\n🧪 Teste 3: Verificar tabela store_products');
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (tableExists) {
      // Teste 4: Contar produtos
      console.log('\n🧪 Teste 4: Contar produtos');
      const count = await db('store_products').count('* as total');
      console.log('✅ Total de produtos:', count[0].total);
      
      // Teste 5: Listar todos os produtos
      console.log('\n🧪 Teste 5: Listar todos os produtos');
      const allProducts = await db('store_products').select('*');
      console.log('✅ Produtos encontrados:', allProducts.length);
      allProducts.forEach(p => {
        console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: ${p.price}, Ativo: ${p.active}`);
      });
      
      // Teste 6: Testar StoreProduct.query()
      console.log('\n🧪 Teste 6: Testar StoreProduct.query()');
      const storeProducts = await StoreProduct.query().where('active', true);
      console.log('✅ StoreProduct.query() encontrou:', storeProducts.length, 'produtos');
      storeProducts.forEach(p => {
        console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: ${p.price}`);
      });
      
      // Teste 7: Testar query específica que o RegistrationController usa
      console.log('\n🧪 Teste 7: Testar query específica do RegistrationController');
      const product3 = await db('store_products')
        .where('id', 3)
        .where('active', true)
        .first();
      console.log('✅ Produto ID 3 encontrado:', !!product3);
      if (product3) {
        console.log('✅ Nome:', product3.name);
        console.log('✅ Preço:', product3.price);
      }
      
      // Teste 8: Testar StoreProduct.query().findById(3)
      console.log('\n🧪 Teste 8: Testar StoreProduct.query().findById(3)');
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

testProductionDatabaseConfig(); 