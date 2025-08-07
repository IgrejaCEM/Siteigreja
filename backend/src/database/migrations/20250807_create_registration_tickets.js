/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('registration_tickets', function(table) {
    table.increments('id').primary();
    table.integer('registration_id').unsigned().references('id').inTable('registrations').onDelete('CASCADE');
    table.integer('lot_id').unsigned().references('id').inTable('lots').onDelete('SET NULL');
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('total_price', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('registration_tickets');
}; 