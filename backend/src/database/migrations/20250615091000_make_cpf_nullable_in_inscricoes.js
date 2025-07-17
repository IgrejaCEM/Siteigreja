exports.up = function(knex) {
  return knex.schema.alterTable('registrations', function(table) {
    table.string('cpf').nullable().alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('registrations', function(table) {
    table.string('cpf').notNullable().alter();
  });
}; 