const { db } = require('./src/database/db');

async function addFormDataColumn() {
  try {
    const hasFormData = await db.schema.hasColumn('registrations', 'form_data');
    if (!hasFormData) {
      await db.schema.table('registrations', table => {
        table.text('form_data');
      });
      console.log('Coluna form_data adicionada com sucesso');
    } else {
      console.log('Coluna form_data já existe');
    }
  } catch (error) {
    console.error('Erro ao adicionar coluna form_data:', error);
  } finally {
    process.exit();
  }
}

addFormDataColumn(); 