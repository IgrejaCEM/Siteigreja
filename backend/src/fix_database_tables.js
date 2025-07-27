const { db } = require('./database/db');

async function fixDatabaseTables() {
  try {
    console.log('🔧 Verificando e criando tabelas faltantes...');
    
    // Verificar tabela payments
    const hasPaymentsTable = await db.schema.hasTable('payments');
    console.log('💰 Tabela payments existe:', hasPaymentsTable);
    
    if (!hasPaymentsTable) {
      console.log('📋 Criando tabela payments...');
      await db.schema.createTable('payments', table => {
        table.increments('id').primary();
        table.string('registration_code').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.string('payment_method').notNullable();
        table.string('status').defaultTo('pending');
        table.string('gateway_payment_id');
        table.json('gateway_response');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela payments criada!');
    }
    
    // Verificar tabela tickets
    const hasTicketsTable = await db.schema.hasTable('tickets');
    console.log('🎫 Tabela tickets existe:', hasTicketsTable);
    
    if (!hasTicketsTable) {
      console.log('📋 Criando tabela tickets...');
      await db.schema.createTable('tickets', table => {
        table.increments('id').primary();
        table.integer('inscricao_id').references('id').inTable('registrations').onDelete('CASCADE');
        table.string('ticket_code').unique().notNullable();
        table.string('status').defaultTo('active');
        table.text('qr_code');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela tickets criada!');
    }
    
    // Verificar tabela registration_products
    const hasRegistrationProductsTable = await db.schema.hasTable('registration_products');
    console.log('🛍️ Tabela registration_products existe:', hasRegistrationProductsTable);
    
    if (!hasRegistrationProductsTable) {
      console.log('📋 Criando tabela registration_products...');
      await db.schema.createTable('registration_products', table => {
        table.increments('id').primary();
        table.integer('registration_id').references('id').inTable('registrations').onDelete('CASCADE');
        table.integer('product_id').references('id').inTable('event_products').onDelete('CASCADE');
        table.integer('quantity').notNullable();
        table.decimal('unit_price', 10, 2).notNullable();
        table.timestamps(true, true);
      });
      console.log('✅ Tabela registration_products criada!');
    }
    
    // Verificar se há dados nas tabelas
    const events = await db('events').select('*');
    console.log('📅 Eventos:', events.length);
    
    const registrations = await db('registrations').select('*');
    console.log('📝 Inscrições:', registrations.length);
    
    const products = await db('event_products').select('*');
    console.log('🛍️ Produtos:', products.length);
    
    const payments = await db('payments').select('*');
    console.log('💰 Pagamentos:', payments.length);
    
    const tickets = await db('tickets').select('*');
    console.log('�� Tickets:', tickets.length);
    
    const registrationProducts = await db('registration_products').select('*');
    console.log('🛍️ Produtos de inscrição:', registrationProducts.length);
    
    console.log('✅ Verificação concluída! Todas as tabelas estão prontas.');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
  }
}

fixDatabaseTables(); 