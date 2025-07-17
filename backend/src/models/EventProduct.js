const { Model } = require('objection');

class EventProduct extends Model {
  static get tableName() {
    return 'event_products';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['event_id', 'name', 'description', 'price', 'image_url'],

      properties: {
        id: { type: 'integer' },
        event_id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string' },
        price: { type: 'number', minimum: 0 },
        image_url: { type: 'string' },
        stock: { type: 'integer', minimum: 0 },
        is_active: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Event = require('./Event');
    const RegistrationProduct = require('./RegistrationProduct');

    return {
      event: {
        relation: Model.BelongsToOneRelation,
        modelClass: Event,
        join: {
          from: 'event_products.event_id',
          to: 'events.id'
        }
      },
      registrationProducts: {
        relation: Model.HasManyRelation,
        modelClass: RegistrationProduct,
        join: {
          from: 'event_products.id',
          to: 'registration_products.product_id'
        }
      }
    };
  }
}

module.exports = EventProduct; 