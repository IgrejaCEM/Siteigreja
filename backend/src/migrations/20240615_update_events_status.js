const knex = require('knex');
const config = require('../../config');

const db = knex(config.database);

async function up() {
  const exists = await db.schema.hasTable('events');
  if (exists) {
    // Verificar se a coluna status já existe
    const hasStatusColumn = await db.schema.hasColumn('events', 'status');
    if (!hasStatusColumn) {
      // Adicionar nova coluna status
      await db.schema.table('events', table => {
        table.string('status').defaultTo('active');
      });
      console.log('Coluna status adicionada com sucesso!');
    }

    // Verificar se a coluna active existe
    const hasActiveColumn = await db.schema.hasColumn('events', 'active');
    if (hasActiveColumn) {
      // Migrar dados da coluna active para status
      const events = await db('events').select('*');
      for (const event of events) {
        await db('events')
          .where('id', event.id)
          .update({
            status: event.active ? 'active' : 'inactive'
          });
      }

      // Remover coluna active
      await db.schema.table('events', table => {
        table.dropColumn('active');
      });
      console.log('Coluna active removida com sucesso!');
    }
  }
}

async function down() {
  const exists = await db.schema.hasTable('events');
  if (exists) {
    // Verificar se a coluna active já existe
    const hasActiveColumn = await db.schema.hasColumn('events', 'active');
    if (!hasActiveColumn) {
      // Adicionar coluna active de volta
      await db.schema.table('events', table => {
        table.boolean('active').defaultTo(true);
      });

      // Migrar dados da coluna status para active
      const events = await db('events').select('*');
      for (const event of events) {
        await db('events')
          .where('id', event.id)
          .update({
            active: event.status === 'active'
          });
      }

      // Verificar se a coluna status existe
      const hasStatusColumn = await db.schema.hasColumn('events', 'status');
      if (hasStatusColumn) {
        // Remover coluna status
        await db.schema.table('events', table => {
          table.dropColumn('status');
        });
      }
    }
  }
}

module.exports = { up, down }; 