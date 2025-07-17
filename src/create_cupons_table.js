const { db } = require('./database/db');

async function createCuponsTable() {
  try {
    const hasCuponsTable = await db.schema.hasTable('cupons');
    if (!hasCuponsTable) {
      await db.schema.createTable('cupons', table => {
        table.increments('id').primary();
        table.string('code').notNullable().unique();
        table.decimal('discount', 10, 2).notNullable();
        table.integer('max_limit');
        table.string('validade');
        table.string('status').defaultTo('ativo');
        table.integer('event_id').references('id').inTable('events');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('Tabela cupons criada com sucesso');
    } else {
      console.log('Tabela cupons já existe');
    }
  } catch (error) {
    console.error('Erro ao criar tabela cupons:', error);
  } finally {
    process.exit();
  }
}

createCuponsTable(); 