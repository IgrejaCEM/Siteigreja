const { Model } = require('objection');

class RegistrationProduct extends Model {
  static get tableName() {
    return 'registration_products';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['registration_id', 'product_id', 'quantity', 'unit_price'],

      properties: {
        id: { type: 'integer' },
        registration_id: { type: 'integer' },
        product_id: { type: 'integer' },
        quantity: { type: 'integer', minimum: 1 },
        unit_price: { type: 'number', minimum: 0 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Registration = require('./Registration');
    const EventProduct = require('./EventProduct');

    return {
      registration: {
        relation: Model.BelongsToOneRelation,
        modelClass: Registration,
        join: {
          from: 'registration_products.registration_id',
          to: 'registrations.id'
        }
      },
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: EventProduct,
        join: {
          from: 'registration_products.product_id',
          to: 'event_products.id'
        }
      }
    };
  }
}

module.exports = RegistrationProduct; 