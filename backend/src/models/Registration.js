const { Model } = require('objection');

class Registration extends Model {
  static get tableName() {
    return 'registrations';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['event_id', 'name', 'email', 'phone'],
      properties: {
        id: { type: 'integer' },
        event_id: { type: 'integer' },
        lot_id: { type: ['integer', 'null'] },
        user_id: { type: ['integer', 'null'] },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        cpf: { type: ['string', 'null'] },
        address: { type: ['string', 'null'] },
        registration_code: { type: ['string', 'null'] },
        status: { type: 'string' },
        payment_status: { type: ['string', 'null'] },
        form_data: { type: ['string', 'null'] },
        created_at: { type: ['string', 'null'], format: 'date-time' },
        updated_at: { type: ['string', 'null'], format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Event = require('./Event');
    const Lot = require('./Lot');
    const User = require('./User');
    const RegistrationProduct = require('./RegistrationProduct');

    return {
      event: {
        relation: Model.BelongsToOneRelation,
        modelClass: Event,
        join: {
          from: 'registrations.event_id',
          to: 'events.id'
        }
      },
      lot: {
        relation: Model.BelongsToOneRelation,
        modelClass: Lot,
        join: {
          from: 'registrations.lot_id',
          to: 'lots.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'registrations.user_id',
          to: 'users.id'
        }
      },
      products: {
        relation: Model.HasManyRelation,
        modelClass: RegistrationProduct,
        join: {
          from: 'registrations.id',
          to: 'registration_products.registration_id'
        }
      }
    };
  }
}

module.exports = Registration; 