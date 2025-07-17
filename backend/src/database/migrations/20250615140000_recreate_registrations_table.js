exports.up = function(knex) {
  return knex.schema.dropTableIfExists('registrations')
    .then(function() {
      return knex.schema.createTable('registrations', function(table) {
        table.increments('id').primary();
        table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
        table.integer('lot_id').unsigned().references('id').inTable('lots').onDelete('SET NULL');
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('phone').notNullable();
        table.string('cpf').nullable();
        table.string('address').nullable();
        table.string('registration_code').nullable();
        table.string('status').defaultTo('pending');
        table.text('form_data').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      });
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('registrations');
}; 