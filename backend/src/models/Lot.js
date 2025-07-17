const { Model } = require('objection');

class Lot extends Model {
  static get tableName() {
    return 'lots';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['event_id', 'name', 'price', 'quantity', 'start_date', 'end_date'],

      properties: {
        id: { type: 'integer' },
        event_id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        price: { type: 'number', minimum: 0 },
        quantity: { type: 'integer', minimum: 0 },
        start_date: { type: 'string', format: 'date-time' },
        end_date: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['active', 'inactive'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Event = require('./Event');
    const Registration = require('./Registration');

    return {
      event: {
        relation: Model.BelongsToOneRelation,
        modelClass: Event,
        join: {
          from: 'lots.event_id',
          to: 'events.id'
        }
      },
      registrations: {
        relation: Model.HasManyRelation,
        modelClass: Registration,
        join: {
          from: 'lots.id',
          to: 'registrations.lot_id'
        }
      }
    };
  }
}

module.exports = Lot; 