/**
 * Adiciona campos visuais de kit aos lotes: kit_images (array JSON em texto) e ticket_image (URL)
 */

exports.up = async function up(knex) {
  const hasKitImages = await knex.schema.hasColumn('lots', 'kit_images');
  const hasTicketImage = await knex.schema.hasColumn('lots', 'ticket_image');
  await knex.schema.alterTable('lots', (table) => {
    if (!hasKitImages) table.text('kit_images').defaultTo('[]');
    if (!hasTicketImage) table.string('ticket_image');
  });
};

exports.down = async function down(knex) {
  const hasKitImages = await knex.schema.hasColumn('lots', 'kit_images');
  const hasTicketImage = await knex.schema.hasColumn('lots', 'ticket_image');
  await knex.schema.alterTable('lots', (table) => {
    if (hasKitImages) table.dropColumn('kit_images');
    if (hasTicketImage) table.dropColumn('ticket_image');
  });
};


