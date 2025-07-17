exports.up = function(knex) {
  return knex.schema.dropTableIfExists('checkin_logs')
    .then(() => knex.schema.dropTableIfExists('tickets'))
    .then(() => knex.schema.createTable('tickets', function(table) {
      table.increments('id').primary();
      table.integer('inscricao_id').unsigned().references('id').inTable('registrations').onDelete('CASCADE');
      table.string('ticket_code').unique().notNullable();
      table.string('status').defaultTo('active');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    }))
    .then(() => knex.schema.createTable('checkin_logs', function(table) {
      table.increments('id').primary();
      table.integer('ticket_id').unsigned().references('id').inTable('tickets').onDelete('CASCADE');
      table.timestamp('checkin_time').defaultTo(knex.fn.now());
      table.string('location').nullable();
      table.string('operator').nullable();
      table.timestamps(true, true);
    }));
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('checkin_logs')
    .then(() => knex.schema.dropTableIfExists('tickets'));
}; 