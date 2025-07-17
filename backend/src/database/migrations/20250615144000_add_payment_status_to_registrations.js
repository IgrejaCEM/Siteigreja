exports.up = function(knex) {
  return knex.schema.table('registrations', function(table) {
    table.string('payment_status').defaultTo('pending');
  });
};

exports.down = function(knex) {
  return knex.schema.table('registrations', function(table) {
    table.dropColumn('payment_status');
  });
}; 