const { Model } = require('objection');

class StoreOrder extends Model {
  static get tableName() {
    return 'store_orders';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['customer_name', 'customer_email', 'total_amount'],

      properties: {
        id: { type: 'integer' },
        customer_name: { type: 'string', minLength: 1, maxLength: 255 },
        customer_email: { type: 'string', format: 'email', maxLength: 255 },
        customer_phone: { type: 'string', maxLength: 20 },
        customer_cpf: { type: 'string', maxLength: 14 },
        customer_address: { type: 'string' },
        status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] },
        total_amount: { type: 'number', minimum: 0 },
        payment_status: { type: 'string', enum: ['pending', 'paid', 'failed'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const StoreOrderItem = require('./StoreOrderItem');

    return {
      items: {
        relation: Model.HasManyRelation,
        modelClass: StoreOrderItem,
        join: {
          from: 'store_orders.id',
          to: 'store_order_items.order_id'
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

module.exports = StoreOrder; 