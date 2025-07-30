/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('events', function(table) {
    table.string('slug').unique();
    table.text('description');
    table.string('image_url');
    table.boolean('active').defaultTo(true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('events', function(table) {
    table.dropColumn('slug');
    table.dropColumn('description');
    table.dropColumn('image_url');
    table.dropColumn('active');
  });
}; 