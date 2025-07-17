exports.up = function(knex) {
  return knex.schema.createTable('lots', function(table) {
    table.increments('id').primary();
    table.integer('event_id').unsigned().references('id').inTable('events');
    table.string('name').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('quantity').notNullable();
    table.datetime('start_date').notNullable();
    table.datetime('end_date').notNullable();
    table.string('status').defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('lots');
}; 