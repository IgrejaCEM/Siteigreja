const { Model } = require('objection');

class StoreProduct extends Model {
  static get tableName() {
    return 'store_products';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'price', 'stock'],

      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string', maxLength: 1000 },
        price: { type: 'number', minimum: 0 },
        stock: { type: 'integer', minimum: 0 },
        image_url: { type: 'string', maxLength: 500 },
        category: { type: 'string', maxLength: 100 },
        active: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const StoreOrderItem = require('./StoreOrderItem');

    return {
      orderItems: {
        relation: Model.HasManyRelation,
        modelClass: StoreOrderItem,
        join: {
          from: 'store_products.id',
          to: 'store_order_items.product_id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = StoreProduct; 