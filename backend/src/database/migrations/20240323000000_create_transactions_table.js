exports.up = function(knex) {
  return knex.schema.createTable('transactions', function(table) {
    table.increments('id').primary();
    table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.string('payment_method').notNullable();
    table.string('status').notNullable();
    table.json('payment_details');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transactions');
}; 