const { Model } = require('objection');

class StoreOrderItem extends Model {
  static get tableName() {
    return 'store_order_items';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['order_id', 'product_id', 'quantity', 'unit_price'],

      properties: {
        id: { type: 'integer' },
        order_id: { type: 'integer' },
        product_id: { type: 'integer' },
        quantity: { type: 'integer', minimum: 1 },
        unit_price: { type: 'number', minimum: 0 },
        total_price: { type: 'number', minimum: 0 },
        created_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const StoreOrder = require('./StoreOrder');
    const StoreProduct = require('./StoreProduct');

    return {
      order: {
        relation: Model.BelongsToOneRelation,
        modelClass: StoreOrder,
        join: {
          from: 'store_order_items.order_id',
          to: 'store_orders.id'
        }
      },
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: StoreProduct,
        join: {
          from: 'store_order_items.product_id',
          to: 'store_products.id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
  }
}

module.exports = StoreOrderItem; 