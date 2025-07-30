const { Model } = require('objection');

class Event extends Model {
  static get tableName() {
    return 'events';
  }
  
  static get idColumn() {
    return 'id';
  }
  
  static get relationMappings() {
    const EventProduct = require('./EventProduct');
    
    return {
      products: {
        relation: Model.HasManyRelation,
        modelClass: EventProduct,
        join: {
          from: 'events.id',
          to: 'event_products.event_id'
        }
      }
    };
  }
}

module.exports = Event; 