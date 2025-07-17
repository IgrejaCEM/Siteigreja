exports.up = function(knex) {
  return knex.schema.createTable('events', function(table) {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.datetime('date').notNullable();
    table.string('location').notNullable();
    table.string('banner').nullable();
    table.string('banner_home').nullable();
    table.string('banner_evento').nullable();
    table.string('slug').unique().notNullable();
    table.string('status').defaultTo('active');
    table.text('additional_info').nullable();
    table.boolean('has_payment').defaultTo(false);
    table.string('payment_gateway').nullable();
    table.json('registration_form').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('events');
}; 