/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('store_orders', function(table) {
    table.increments('id').primary();
    table.string('customer_name', 255).notNullable();
    table.string('customer_email', 255).notNullable();
    table.string('customer_phone', 20);
    table.string('customer_cpf', 14);
    table.text('customer_address');
    table.enum('status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled']).notNullable().defaultTo('pending');
    table.decimal('total_amount', 10, 2).notNullable().defaultTo(0);
    table.enum('payment_status', ['pending', 'paid', 'failed']).notNullable().defaultTo('pending');
    table.timestamps(true, true);
    
    // Índices
    table.index('status');
    table.index('payment_status');
    table.index('customer_email');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('store_orders');
}; 