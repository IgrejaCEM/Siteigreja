exports.up = function(knex) {
  return knex.schema.table('tickets', function(table) {
    table.text('qr_code').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('tickets', function(table) {
    table.dropColumn('qr_code');
  });
}; 