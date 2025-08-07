const { db } = require('./src/database/db');

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas no banco de produção...');
    
    // Verificar se a tabela registration_tickets existe
    const hasRegistrationTickets = await db.schema.hasTable('registration_tickets');
    console.log('📊 Tabela registration_tickets existe:', hasRegistrationTickets);
    
    // Verificar se a tabela registration_products existe
    const hasRegistrationProducts = await db.schema.hasTable('registration_products');
    console.log('📊 Tabela registration_products existe:', hasRegistrationProducts);
    
    // Verificar estrutura da tabela registrations
    try {
      const registrationsColumns = await db.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'registrations'");
      console.log('📊 Colunas da tabela registrations:', registrationsColumns.rows.map(row => row.column_name));
    } catch (error) {
      console.log('❌ Erro ao verificar colunas:', error.message);
    }
    
    if (!hasRegistrationTickets) {
      console.log('❌ Tabela registration_tickets não existe! Criando...');
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
      console.log('✅ Tabela registration_tickets criada!');
    }
    
    if (!hasRegistrationProducts) {
      console.log('❌ Tabela registration_products não existe! Criando...');
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
      console.log('✅ Tabela registration_products criada!');
    }
    
    console.log('✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
  } finally {
    process.exit(0);
  }
}

checkTables(); 