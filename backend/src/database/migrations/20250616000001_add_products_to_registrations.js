exports.up = function(knex) {
  return knex.schema.table('registrations', function(table) {
    table.json('products').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('registrations', function(table) {
    table.dropColumn('products');
  });
}; 