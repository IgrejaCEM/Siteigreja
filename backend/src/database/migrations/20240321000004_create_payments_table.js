exports.up = function(knex) {
  return knex.schema.createTable('payments', function(table) {
    table.increments('id').primary();
    table.string('registration_code').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('payment_method').notNullable();
    table.string('status').notNullable().defaultTo('pending');
    table.string('transaction_id').nullable();
    table.json('payment_details').nullable();
    table.timestamps(true, true);

    table.index('registration_code');
    table.index('status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payments');
}; 