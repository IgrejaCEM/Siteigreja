exports.up = function(knex) {
  return knex.schema.table('registrations', table => {
    table.integer('lote_id').unsigned().references('id').inTable('lots');
  });
};

exports.down = function(knex) {
  return knex.schema.table('registrations', table => {
    table.dropColumn('lote_id');
  });
}; 