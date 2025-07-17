exports.up = function(knex) {
  return knex.schema.table('registrations', function(table) {
    // table.string('address').nullable(); // Já existe!
    // table.string('cpf').nullable(); // Já existe!
  });
};

exports.down = function(knex) {
  return knex.schema.table('registrations', function(table) {
    // table.dropColumn('address');
    // table.dropColumn('cpf');
  });
}; 