const db = require('./database/db');

async function checkAndAddLoteIdColumn() {
  try {
    // Verificar se a coluna existe
    const hasColumn = await db.schema.hasColumn('registrations', 'lote_id');
    
    if (hasColumn) {
      console.log('A coluna lote_id já existe na tabela registrations.');
    } else {
      // Adicionar a coluna
      await db.schema.alterTable('registrations', table => {
        table.integer('lote_id').unsigned().references('id').inTable('lots');
      });
      console.log('Coluna lote_id adicionada com sucesso!');
    }
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
  process.exit(0);
}

checkAndAddLoteIdColumn(); 