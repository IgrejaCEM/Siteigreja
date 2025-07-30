/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('store_order_items', function(table) {
    table.increments('id').primary();
    table.integer('order_id').unsigned().notNullable();
    table.integer('product_id').unsigned().notNullable();
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('total_price', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Chaves estrangeiras
    table.foreign('order_id').references('id').inTable('store_orders').onDelete('CASCADE');
    table.foreign('product_id').references('id').inTable('store_products').onDelete('RESTRICT');
    
    // Índices
    table.index('order_id');
    table.index('product_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('store_order_items');
}; 