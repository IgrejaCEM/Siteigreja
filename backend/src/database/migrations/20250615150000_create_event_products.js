exports.up = function(knex) {
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
  })
  .createTable('registration_products', function(table) {
    table.increments('id').primary();
    table.integer('registration_id').unsigned().references('id').inTable('registrations').onDelete('CASCADE');
    table.integer('product_id').unsigned().references('id').inTable('event_products').onDelete('CASCADE');
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('registration_products')
    .dropTableIfExists('event_products');
}; 