const knex = require('knex');
const knexfile = require('./knexfile');

async function deployStoreOnly() {
  try {
    console.log('🚀 Executando migrações da loja no banco de produção...');
    
    // Conectar ao banco de produção
    const db = knex(knexfile.production);
    
    // Executar apenas as migrações da loja
    const storeMigrations = [
      '20250730000000_create_store_products_table.js',
      '20250730000001_create_store_orders_table.js',
      '20250730000002_create_store_order_items_table.js'
    ];
    
    for (const migration of storeMigrations) {
      try {
        console.log(`📋 Executando migração: ${migration}`);
        await db.migrate.up({ name: migration });
        console.log(`✅ Migração executada: ${migration}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⏭️ Migração já existe: ${migration}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('🎉 Migrações da loja executadas com sucesso!');
    
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    process.exit(1);
  }
}

deployStoreOnly(); 