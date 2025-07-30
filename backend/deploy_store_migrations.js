const knex = require('knex');
const knexfile = require('./knexfile');

async function deployStoreMigrations() {
  try {
    console.log('🚀 Executando migrações da loja no banco de produção...');
    
    // Conectar ao banco de produção
    const db = knex(knexfile.production);
    
    // Executar migrações
    const [batchNo, log] = await db.migrate.latest();
    
    console.log(`✅ Migrações executadas com sucesso! Batch: ${batchNo}`);
    console.log('📋 Migrações executadas:', log);
    
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    process.exit(1);
  }
}

deployStoreMigrations(); 