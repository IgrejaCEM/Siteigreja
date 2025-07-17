exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('phone').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('phone');
  });
}; 