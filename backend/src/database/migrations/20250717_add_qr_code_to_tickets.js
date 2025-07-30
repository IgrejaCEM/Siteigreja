/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('tickets', function(table) {
    table.string('qr_code');
    table.string('qr_code_url');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('tickets', function(table) {
    table.dropColumn('qr_code');
    table.dropColumn('qr_code_url');
  });
}; 