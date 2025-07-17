exports.up = function(knex) {
  return knex.schema.createTable('tickets', function(table) {
    table.increments('id').primary();
    table.integer('inscricao_id').unsigned().references('id').inTable('registrations');
    table.string('ticket_code').unique().notNullable();
    table.string('qr_code').unique().notNullable();
    table.string('status').defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tickets');
}; 