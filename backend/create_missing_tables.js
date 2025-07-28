const { db } = require('./src/database/db');

async function createMissingTables() {
  try {
    console.log('🔧 Criando tabelas que estão faltando...');
    
    // Verificar e criar tabela event_products
    const eventProductsExists = await db.schema.hasTable('event_products');
    if (!eventProductsExists) {
      console.log('📋 Criando tabela event_products...');
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
    } else {
      console.log('ℹ️ Tabela event_products já existe');
    }
    
    // Verificar e criar tabela settings
    const settingsExists = await db.schema.hasTable('settings');
    if (!settingsExists) {
      console.log('📋 Criando tabela settings...');
      await db.schema.createTable('settings', table => {
        table.increments('id').primary();
        table.text('homeLayout').nullable();
        table.timestamp('createdAt').defaultTo(db.fn.now());
        table.timestamp('updatedAt').defaultTo(db.fn.now());
      });
      console.log('✅ Tabela settings criada!');
    } else {
      console.log('ℹ️ Tabela settings já existe');
    }
    
    console.log('🎉 Todas as tabelas foram criadas!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

createMissingTables(); 