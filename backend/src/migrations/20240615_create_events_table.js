const knex = require('knex');
const config = require('../../config');

const db = knex(config.database);

async function up() {
  const exists = await db.schema.hasTable('events');
  if (!exists) {
    await db.schema.createTable('events', table => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description');
      table.date('date').notNullable();
      table.string('location');
      table.decimal('price', 10, 2);
      table.string('banner');
      table.string('banner_home');
      table.string('banner_evento');
      table.string('slug').unique();
      table.string('status').defaultTo('active');
      table.timestamps(true, true);
    });
    console.log('Tabela events criada com sucesso!');
  }
}

async function down() {
  const exists = await db.schema.hasTable('events');
  if (exists) {
    await db.schema.dropTable('events');
    console.log('Tabela events removida com sucesso!');
  }
}

module.exports = { up, down }; 