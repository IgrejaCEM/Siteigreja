const { db } = require('./src/database/db');

async function forceCreateTables() {
  try {
    console.log('🔧 Forçando criação das tabelas no banco de produção...');
    
    // Verificar se a tabela registration_tickets existe
    const hasRegistrationTickets = await db.schema.hasTable('registration_tickets');
    console.log('📊 Tabela registration_tickets existe:', hasRegistrationTickets);
    
    if (!hasRegistrationTickets) {
      console.log('❌ Tabela registration_tickets não existe! Criando...');
      
      // Criar tabela registration_tickets
      await db.schema.createTable('registration_tickets', function(table) {
        table.increments('id').primary();
        table.integer('registration_id').unsigned().references('id').inTable('registrations').onDelete('CASCADE');
        table.integer('lot_id').unsigned().references('id').inTable('lots').onDelete('SET NULL');
        table.integer('quantity').notNullable().defaultTo(1);
        table.decimal('unit_price', 10, 2).notNullable();
        table.decimal('total_price', 10, 2).notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      
      console.log('✅ Tabela registration_tickets criada com sucesso!');
    } else {
      console.log('✅ Tabela registration_tickets já existe!');
    }
    
    // Verificar se a tabela registration_products existe
    const hasRegistrationProducts = await db.schema.hasTable('registration_products');
    console.log('📊 Tabela registration_products existe:', hasRegistrationProducts);
    
    if (!hasRegistrationProducts) {
      console.log('❌ Tabela registration_products não existe! Criando...');
      
      // Criar tabela registration_products
      await db.schema.createTable('registration_products', function(table) {
        table.increments('id').primary();
        table.integer('registration_id').unsigned().references('id').inTable('registrations').onDelete('CASCADE');
        table.integer('product_id').unsigned().references('id').inTable('event_products').onDelete('SET NULL');
        table.integer('quantity').notNullable().defaultTo(1);
        table.decimal('unit_price', 10, 2).notNullable();
        table.decimal('total_price', 10, 2).notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      
      console.log('✅ Tabela registration_products criada com sucesso!');
    } else {
      console.log('✅ Tabela registration_products já existe!');
    }
    
    console.log('✅ Todas as tabelas foram criadas/verificadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  } finally {
    process.exit(0);
  }
}

forceCreateTables(); 