// Tabela de configurações
if (!await knex.schema.hasTable('settings')) {
  await knex.schema.createTable('settings', table => {
    table.increments('id').primary();
    table.text('value').notNullable();
    table.timestamps(true, true);
  });
  console.log('Tabela settings pronta.');
} 