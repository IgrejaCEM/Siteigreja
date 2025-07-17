exports.up = function(knex) {
  return knex.schema.table('registrations', table => {
    table.text('form_data');
  });
};

exports.down = function(knex) {
  return knex.schema.table('registrations', table => {
    table.dropColumn('form_data');
  });
}; 