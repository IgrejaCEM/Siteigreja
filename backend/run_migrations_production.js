const { db } = require('./src/database/db');

async function runMigrations() {
  try {
    console.log('🔧 Executando migrations no banco de produção...');
    
    // Verificar migrations pendentes
    const pendingMigrations = await db.migrate.list();
    console.log('📊 Migrações pendentes:', pendingMigrations[1].length);
    
    if (pendingMigrations[1].length > 0) {
      console.log('📋 Migrações pendentes:');
      pendingMigrations[1].forEach((migration, index) => {
        console.log(`  ${index + 1}. ${migration}`);
      });
      
      // Executar migrations
      console.log('🚀 Executando migrations...');
      const result = await db.migrate.latest();
      console.log('✅ Migrations executadas:', result);
    } else {
      console.log('✅ Nenhuma migration pendente');
    }
    
    // Verificar se as tabelas foram criadas
    const tables = ['store_products', 'registration_store_products'];
    for (const table of tables) {
      const exists = await db.schema.hasTable(table);
      console.log(`📊 Tabela ${table} existe:`, exists);
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
  } finally {
    process.exit(0);
  }
}

runMigrations(); 