exports.up = function(knex) {
  return knex.schema.hasTable('settings').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('settings', function(table) {
        table.increments('id').primary();
        table.text('value').notNullable();
        table.timestamps(true, true);
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('settings');
}; 