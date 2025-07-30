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

async function forcarMigracaoEventProducts() {
  console.log('🔄 FORÇANDO MIGRAÇÃO DA TABELA EVENT_PRODUCTS');
  console.log('==============================================');
  
  try {
    const db = knex(config);
    
    // 1. Verificar se a tabela existe
    console.log('📋 [1/4] Verificando tabela event_products...');
    const hasTable = await db.schema.hasTable('event_products');
    console.log(`📊 Tabela event_products existe: ${hasTable}`);
    
    if (hasTable) {
      console.log('📋 Estrutura atual da tabela:');
      const columns = await db.schema.tableInfo('event_products');
      columns.forEach(column => {
        console.log(`  - ${column.name}: ${column.type} ${column.notnull ? '(NOT NULL)' : ''}`);
      });
    }
    
    // 2. Verificar migrações executadas
    console.log('\n📋 [2/4] Verificando migrações executadas...');
    const hasMigrationsTable = await db.schema.hasTable('knex_migrations');
    if (hasMigrationsTable) {
      const migrations = await db('knex_migrations').select('*').orderBy('id');
      console.log(`📊 Total de migrações: ${migrations.length}`);
      migrations.forEach(migration => {
        console.log(`  - ${migration.name} (${migration.migration_time})`);
      });
    }
    
    // 3. Se a tabela não existe, criar manualmente
    if (!hasTable) {
      console.log('\n📋 [3/4] Criando tabela event_products manualmente...');
      await db.schema.createTable('event_products', table => {
        table.increments('id').primary();
        table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
        table.string('name').notNullable();
        table.text('description').notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.string('image_url').notNullable();
        table.integer('stock').notNullable().defaultTo(0);
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✅ Tabela event_products criada!');
      
      // Registrar migração manualmente
      await db('knex_migrations').insert({
        name: '20250615150000_create_event_products.js',
        batch: 1,
        migration_time: new Date()
      });
      console.log('✅ Migração registrada!');
    }
    
    // 4. Testar criação de produto
    console.log('\n📋 [4/4] Testando criação de produto...');
    const produto = {
      event_id: 13,
      name: 'Produto Teste Migração',
      description: 'Produto criado após migração',
      price: 20.00,
      image_url: 'https://via.placeholder.com/300x200?text=Teste+Migracao',
      stock: 5,
      is_active: true
    };
    
    const [id] = await db('event_products').insert(produto).returning('id');
    console.log(`✅ Produto criado com ID: ${id}`);
    
    // Verificar se foi persistido
    const produtoCriado = await db('event_products').where('id', id).first();
    if (produtoCriado) {
      console.log('✅ Produto persistido corretamente:');
      console.log(`  - ID: ${produtoCriado.id}`);
      console.log(`  - Nome: ${produtoCriado.name}`);
      console.log(`  - Preço: ${produtoCriado.price}`);
      console.log(`  - Event ID: ${produtoCriado.event_id}`);
    }
    
    await db.destroy();
    console.log('\n🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

forcarMigracaoEventProducts(); 