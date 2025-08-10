/**
 * Adiciona o campo kit_includes na tabela lots para listar os itens que o participante ganha com o ingresso
 * Armazenado como JSON em texto (string JSON) para compatibilidade ampla
 */

exports.up = async function up(knex) {
  const exists = await knex.schema.hasColumn('lots', 'kit_includes');
  if (!exists) {
    await knex.schema.alterTable('lots', (table) => {
      table.text('kit_includes').defaultTo('[]');
    });
  }
};

exports.down = async function down(knex) {
  const exists = await knex.schema.hasColumn('lots', 'kit_includes');
  if (exists) {
    await knex.schema.alterTable('lots', (table) => {
      table.dropColumn('kit_includes');
    });
  }
};


