/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('events', function(table) {
    table.string('banner_desktop').nullable().after('banner');
    table.string('banner_mobile').nullable().after('banner_desktop');
    table.string('banner_evento_desktop').nullable().after('banner_evento');
    table.string('banner_evento_mobile').nullable().after('banner_evento_desktop');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('events', function(table) {
    table.dropColumn('banner_desktop');
    table.dropColumn('banner_mobile');
    table.dropColumn('banner_evento_desktop');
    table.dropColumn('banner_evento_mobile');
  });
}; 