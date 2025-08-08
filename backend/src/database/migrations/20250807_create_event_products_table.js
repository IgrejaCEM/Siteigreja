exports.up = function(knex) {
  return knex.schema.hasTable('event_products').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('event_products', function(table) {
        table.increments('id').primary();
        table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
        table.string('name').notNullable();
        table.text('description').notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.string('image_url').notNullable();
        table.integer('stock').notNullable().defaultTo(0);
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('event_products');
};