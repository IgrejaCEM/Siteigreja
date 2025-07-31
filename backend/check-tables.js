const { db } = require('./src/database/db');

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas no banco...');
    
    // Verificar se a tabela store_products existe
    const storeProductsExists = await db.schema.hasTable('store_products');
    console.log('📊 Tabela store_products existe:', storeProductsExists);
    
    if (storeProductsExists) {
      const storeProducts = await db('store_products').select('*');
      console.log('📊 Produtos da loja encontrados:', storeProducts.length);
    }
    
    // Verificar se a tabela registration_store_products existe
    const registrationStoreProductsExists = await db.schema.hasTable('registration_store_products');
    console.log('📊 Tabela registration_store_products existe:', registrationStoreProductsExists);
    
    // Listar todas as tabelas
    const tables = await db.raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log('📊 Todas as tabelas:', tables.rows.map(row => row.tablename));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkTables(); 