exports.up = function(knex) {
  return knex.schema.table('tickets', function(table) {
    table.timestamp('checkin_time').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('tickets', function(table) {
    table.dropColumn('checkin_time');
  });
}; 