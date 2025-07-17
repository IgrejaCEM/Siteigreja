exports.up = function(knex) {
  return knex.schema.table('lots', function(table) {
    table.boolean('is_free').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table('lots', function(table) {
    table.dropColumn('is_free');
  });
}; 