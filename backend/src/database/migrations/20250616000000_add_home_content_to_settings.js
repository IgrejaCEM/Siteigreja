exports.up = function(knex) {
  return knex.schema.hasTable('settings').then(function(exists) {
    if (exists) {
      return knex.schema.table('settings', function(table) {
        // Adicionar colunas se não existirem
        if (!knex.schema.hasColumn('settings', 'homeContent')) {
          table.text('homeContent');
        }
        if (!knex.schema.hasColumn('settings', 'homeCss')) {
          table.text('homeCss');
        }
      });
    } else {
      // Se a tabela não existir, criar com todas as colunas
      return knex.schema.createTable('settings', function(table) {
        table.increments('id').primary();
        table.text('value');
        table.text('homeContent');
        table.text('homeCss');
        table.timestamps(true, true);
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.table('settings', function(table) {
    table.dropColumn('homeContent');
    table.dropColumn('homeCss');
  });
}; 