const knex = require('knex');
const path = require('path');

// Configuração para o banco de produção
const productionConfig = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/igreja',
  migrations: {
    directory: path.join(__dirname, 'src/database/migrations')
  },
  pool: {
    min: 2,
    max: 10
  }
};

async function runMigration() {
  try {
    console.log('🚀 Executando migration no banco de produção...');
    
    const db = knex(productionConfig);
    
    // Verificar status das migrations
    const status = await db.migrate.status();
    console.log('📊 Status das migrations:', status);
    
    // Executar migrations pendentes
    const result = await db.migrate.latest();
    console.log('✅ Resultado da migration:', result);
    
    // Verificar se a tabela foi criada
    const hasTable = await db.schema.hasTable('registration_store_products');
    console.log('✅ Tabela registration_store_products existe:', hasTable);
    
    await db.destroy();
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
  }
}

runMigration(); 