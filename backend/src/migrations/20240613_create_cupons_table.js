const knex = require('knex');
const config = require('../../config');

const db = knex(config.database);

async function up() {
  const exists = await db.schema.hasTable('cupons');
  if (!exists) {
    await db.schema.createTable('cupons', table => {
      table.increments('id').primary();
      table.string('code').unique().notNullable();
      table.decimal('discount', 10, 2).notNullable();
      table.integer('max_limit');
      table.integer('used').defaultTo(0);
      table.date('validade');
      table.string('status').defaultTo('active');
      table.integer('event_id').unsigned().references('id').inTable('events');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Tabela cupons criada com sucesso!');
  }
}

async function down() {
  const exists = await db.schema.hasTable('cupons');
  if (exists) {
    await db.schema.dropTable('cupons');
    console.log('Tabela cupons removida com sucesso!');
  }
}

module.exports = { up, down }; 