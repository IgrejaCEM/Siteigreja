const { db } = require('./src/database/db');

async function addLoteIdColumn() {
  try {
    const hasLoteId = await db.schema.hasColumn('registrations', 'lote_id');
    if (!hasLoteId) {
      await db.schema.table('registrations', table => {
        table.integer('lote_id').references('id').inTable('lots');
      });
      console.log('Coluna lote_id adicionada com sucesso');
    } else {
      console.log('Coluna lote_id já existe');
    }
  } catch (error) {
    console.error('Erro ao adicionar coluna lote_id:', error);
  } finally {
    process.exit();
  }
}

addLoteIdColumn(); 