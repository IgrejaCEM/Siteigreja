exports.up = function(knex) {
  return knex.schema.createTable('checkin_logs', function(table) {
    table.increments('id').primary();
    table.integer('ticket_id').unsigned().references('id').inTable('tickets');
    table.timestamp('checkin_time').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('checkin_logs');
}; 