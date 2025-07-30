/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const columns = ['banner_desktop', 'banner_mobile', 'banner_evento_desktop', 'banner_evento_mobile'];
  
  for (const column of columns) {
    const exists = await knex.schema.hasColumn('events', column);
    if (!exists) {
      await knex.schema.table('events', function(table) {
        table.string(column, 255).nullable();
      });
    }
  }
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