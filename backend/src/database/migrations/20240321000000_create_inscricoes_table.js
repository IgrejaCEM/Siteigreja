exports.up = function(knex) {
  return knex.schema.createTable('registrations', function(table) {
    table.increments('id').primary();
    table.integer('event_id').unsigned().references('id').inTable('events');
    table.integer('lot_id').unsigned().references('id').inTable('lots');
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.string('phone').notNullable();
    table.string('cpf').notNullable();
    table.date('birthdate').notNullable();
    table.string('address').notNullable();
    table.string('city').notNullable();
    table.string('state').notNullable();
    table.string('zipcode').notNullable();
    table.string('status').defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('registrations');
}; 