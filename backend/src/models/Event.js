const { Model } = require('objection');

class Event extends Model {
  static get tableName() {
    return 'events';
  }
  static get idColumn() {
    return 'id';
  }
}

module.exports = Event; 