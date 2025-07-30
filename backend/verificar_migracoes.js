const knex = require('knex');
const path = require('path');

// Configuração PostgreSQL (produção)
const config = {
  client: 'pg',
  connection: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway',
  migrations: {
    directory: path.join(__dirname, 'src', 'database', 'migrations')
  }
};

async function verificarMigracoes() {
  console.log('🔍 VERIFICANDO STATUS DAS MIGRAÇÕES');
  console.log('=====================================');
  
  try {
    const db = knex(config);
    
    // Verificar se a tabela de migrações existe
    console.log('📋 [1/3] Verificando tabela de migrações...');
    const hasMigrationsTable = await db.schema.hasTable('knex_migrations');
    console.log(`📊 Tabela knex_migrations existe: ${hasMigrationsTable}`);
    
    if (hasMigrationsTable) {
      // Listar migrações executadas
      const migrations = await db('knex_migrations').select('*').orderBy('id');
      console.log(`📊 Total de migrações executadas: ${migrations.length}`);
      
      console.log('📋 Migrações encontradas:');
      migrations.forEach((migration, index) => {
        console.log(`  ${index + 1}. ID: ${migration.id} | Nome: ${migration.name} | Executada em: ${migration.migration_time}`);
      });
    }
    
    // Verificar se a tabela event_products existe
    console.log('\n📋 [2/3] Verificando tabela event_products...');
    const hasEventProductsTable = await db.schema.hasTable('event_products');
    console.log(`📊 Tabela event_products existe: ${hasEventProductsTable}`);
    
    if (hasEventProductsTable) {
      // Verificar estrutura da tabela
      const columns = await db.schema.tableInfo('event_products');
      console.log('📋 Estrutura da tabela event_products:');
      columns.forEach(column => {
        console.log(`  - ${column.name}: ${column.type} ${column.notnull ? '(NOT NULL)' : ''}`);
      });
      
      // Contar produtos
      const count = await db('event_products').count('* as total');
      console.log(`📊 Total de produtos: ${count[0].total}`);
    }
    
    // Tentar executar migrações pendentes
    console.log('\n📋 [3/3] Verificando migrações pendentes...');
    try {
      const pendingMigrations = await db.migrate.list();
      console.log(`📊 Migrações pendentes: ${pendingMigrations[1].length}`);
      
      if (pendingMigrations[1].length > 0) {
        console.log('📋 Migrações pendentes:');
        pendingMigrations[1].forEach((migration, index) => {
          console.log(`  ${index + 1}. ${migration}`);
        });
        
        console.log('🔄 Executando migrações pendentes...');
        const result = await db.migrate.latest();
        console.log(`✅ Migrações executadas: ${result.length}`);
      } else {
        console.log('✅ Todas as migrações já foram executadas');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar migrações pendentes:', error.message);
    }
    
    await db.destroy();
    console.log('\n✅ Verificação concluída');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

verificarMigracoes(); 