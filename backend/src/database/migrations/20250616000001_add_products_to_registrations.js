exports.up = async function(knex) {
  const exists = await knex.schema.hasColumn('registrations', 'products');
  if (!exists) {
    return knex.schema.table('registrations', function(table) {
      table.json('products');
    });
  }
};

exports.down = function(knex) {
  return knex.schema.table('registrations', function(table) {
    table.dropColumn('products');
  });
}; 