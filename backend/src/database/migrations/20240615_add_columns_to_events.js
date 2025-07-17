exports.up = function(knex) {
  return knex.schema.table('events', function(table) {
    // table.boolean('has_payment').defaultTo(false); // Já existe!
    // table.string('payment_gateway').nullable(); // Já existe!
    // table.json('registration_form').nullable(); // Já existe!
  });
};

exports.down = function(knex) {
  return knex.schema.table('events', function(table) {
    // table.dropColumn('has_payment');
    // table.dropColumn('payment_gateway');
    // table.dropColumn('registration_form');
  });
}; 